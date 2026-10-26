# 🤖 Bot de WhatsApp Business con Claude

Bot integrado en este proyecto Next.js. Atiende a quien escribe al número de WhatsApp de
David: responde dudas sobre los servicios, cotiza **solo** los 3 paquetes del catálogo y
capta leads (tool `save_lead`). El diseño completo y las fases están en
[`docs/whatsapp-bot-spec.md`](docs/whatsapp-bot-spec.md).

## Arquitectura

```
WhatsApp → Meta Cloud API → POST /api/whatsapp (webhook en Vercel)
                                   │  firma HMAC → dedup → 200 → after(processMessage)
                                   ▼
                       lib/whatsapp/process.ts  (handoff → rate limit → tipo → budget → Claude)
                                   │
          ┌────────────────────────┼─────────────────────────┐
          ▼                        ▼                         ▼
   lib/whatsapp/store.ts    lib/whatsapp/claude.ts     lib/whatsapp/graph.ts
   Upstash Redis            Claude vía OrcAI           Graph API (responder,
   (dedup, historial,       + tool save_lead           marcar leído, avisos
   handoff, leads)          → lib/whatsapp/leads.ts    a David)

Vercel Cron (diario) → GET /api/cron/redis-ping → SET en Redis (keep-alive de Upstash)
```

| Archivo | Rol |
|---|---|
| `lib/whatsapp/catalog.ts` | **Fuente única** de paquetes, precios, correo de contacto e intereses de lead. El prompt se genera desde aquí. |
| `lib/whatsapp/prompt.ts` | System prompt: catálogo, reglas de precio, contención de alcance, cierre, privacidad. |
| `lib/whatsapp/claude.ts` | Bucle manual de tool use (máx. 3 requests por mensaje) con fallback sin tools. |
| `lib/whatsapp/tools.ts` | Definición de `save_lead` (activa). Tools de agendamiento desactivadas hasta la Fase 4b. |
| `lib/whatsapp/leads.ts` | Valida, guarda y avisa. `LEAD_NOTIFIERS` = WhatsApp a David + correo; un canal nuevo se agrega ahí. |
| `lib/whatsapp/email.ts` | `sendLeadEmail`: correo de cada lead vía Resend (fetch nativo, fail-open). |
| `lib/whatsapp/store.ts` | Redis con fallos que solo se registran (fail-open) y timeout corto por comando. |
| `lib/whatsapp/limits.ts` | Rate limit por contacto y tope diario de requests a Claude. |

## Reglas de negocio del bot

- Solo cotiza los 3 paquetes de `catalog.ts`. El MVP siempre como "desde $1,200".
- Fuera del catálogo no da ningún número: David cotiza según el alcance.
- No negocia ni rebaja: "los precios del catálogo son fijos". Nunca dice que David
  "confirma el precio final" de un paquete publicado (suena negociable).
- En español siempre tutea (tienes, quieres, cuéntame); nunca voseo.
- No ofrece llamadas. Cierre: "David te contacta por correo o WhatsApp".
- No hace trabajo técnico gratis (código, ejercicios, asistente general). Además del prompt,
  `process.ts` reemplaza cualquier respuesta que traiga un bloque de código.
- El único correo que puede dar es `hire@davidsaenz.dev`.

Para cambiar un precio o un paquete, edita **solo** `catalog.ts`. (Las tarjetas de
`/services` en `locales/` todavía duplican los precios; se conectan en un PR aparte.)

## Configuración

### 1. Claude (vía OrcAI)
- `ANTHROPIC_API_KEY` y `ANTHROPIC_BASE_URL` (endpoint del proxy; vacío = API directa).
- `CLAUDE_MODEL` (por defecto `claude-haiku-4-5`) y `CLAUDE_MAX_TOKENS`.
- Si el proxy rechaza las requests con tools, el bot responde igual sin ellas (y sin
  guardar leads). Queda en el log: `el proxy rechazó la request con tools`.

### 2. Meta / WhatsApp Business
1. En https://developers.facebook.com, en la app de tipo Business con el producto WhatsApp, copia:
   - **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - Token permanente de *System User* (permiso `whatsapp_business_messaging`) → `WHATSAPP_ACCESS_TOKEN`
   - **App Secret** (App Settings → Basic) → `WHATSAPP_APP_SECRET` (obligatorio: sin él, todo POST da 403)
2. Inventa un token de verificación (`openssl rand -hex 32`) → `WHATSAPP_VERIFY_TOKEN`.
3. Webhook: Callback URL `https://www.davidsaenz.dev/api/whatsapp`, el mismo verify token,
   y suscripción al campo `messages`.

### 3. Upstash Redis
- Integración de Upstash en el marketplace de Vercel. Inyecta
  `UPSTASH_REDIS_KV_REST_API_URL` y `UPSTASH_REDIS_KV_REST_API_TOKEN`.
- Sin ellas el bot funciona sin persistencia (solo para pruebas locales).

### 4. Avisos a David
Cada lead nuevo (o actualizado con datos distintos) dispara dos avisos en paralelo
(`Promise.allSettled`): si uno falla, el otro sale igual y el cliente recibe su respuesta.

**WhatsApp**
- `OWNER_WHATSAPP_NUMBER`: tu número personal (formato `573001234567`).
- ⚠️ Es texto libre: Meta solo lo entrega si ese número le escribió al bot en las
  **últimas 24 h**. Si no, Graph responde **131047** y el aviso se pierde (queda en el
  log). Por eso existe el correo.

**Correo (Resend)**
- `RESEND_API_KEY`: API key de Resend. El dominio `davidsaenz.dev` debe estar verificado.
- Remitente `Bot David <bot@davidsaenz.dev>`, destinatario `hire@davidsaenz.dev`
  (`CONTACT_EMAIL` de `catalog.ts`). Si el lead dio email, va como `reply_to`:
  responder el correo le escribe directo al cliente.
- Asunto: `🔔 Nuevo lead — <paquete o "A medida"> — <nombre>` (o `🔁 Lead actualizado — …`).
  El cuerpo (texto y HTML) trae nombre, email, teléfono, wa_id, interés, resumen,
  fechas en hora de Bogotá y el link `https://wa.me/<wa_id>`.
- Fail-open: sin key se omite con `[lead-email] RESEND_API_KEY no configurada…`. Si
  Resend responde no-2xx o pasa el timeout de 5 s, se registra `[lead-email]` con el
  status y el cuerpo, sin lanzar. La key nunca se registra.

En cualquier caso el lead queda en Redis (`lead:{wa_id}`).

### 5. Cron de keep-alive
- `CRON_SECRET` en Vercel (`openssl rand -hex 32`). Vercel lo manda como
  `Authorization: Bearer …` a `/api/cron/redis-ping`, programado en `vercel.json`
  una vez al día (Hobby solo permite crons diarios).
- Si Redis falla, la ruta responde 503 y la ejecución sale en rojo en
  **Vercel → Settings → Cron Jobs**.

### 6. Límites
- `RL_MAX_PER_HOUR` (por contacto) y `CLAUDE_DAILY_LIMIT` (requests a Claude por día;
  un mensaje que guarda un lead usa 2).

## Si Redis se cae

El webhook sigue respondiendo 200 y el bot sigue contestando:

| Pieza | Comportamiento con Redis caído |
|---|---|
| Dedup | Procesa sin dedup |
| Historial | Responde sin contexto y no guarda |
| Handoff | Asume que no hay handoff (el bot responde) |
| Rate limit / tope diario | Dejan pasar (riesgo aceptado: sin tope de gasto mientras dure la caída) |
| Leads | Solo salen por los avisos; se registra `el lead NO quedó guardado en Redis` |

Cada comando tiene un timeout de 2 s con 1 reintento, para no demorar el 200 a Meta.
Todo error queda en el log como `[whatsapp] Redis falló en <operación>`.

## Datos guardados en Redis

| Clave | Contenido | TTL |
|---|---|---|
| `dedup:{message_id}` | Marca de mensaje ya procesado | 24 h |
| `chat:{wa_id}` | Historial (últimos 40 turnos) | 24 h |
| `human:{wa_id}` | Flag de handoff | 24 h |
| `rl:{wa_id}:{hora}`, `rl:notified:{wa_id}` | Rate limit | 1 h |
| `budget:claude:{fecha}`, `budget:alerted:{fecha}` | Tope diario | 48 h |
| `lead:{wa_id}` | Lead: nombre, email, teléfono, interés, resumen, fechas | **180 días** (política de privacidad §4) |
| `leads:index` | Sorted set wa_id → timestamp, recortado a 180 días | 180 días |
| `health:redis-ping` | Último ping del cron | 7 días |

Para ver los leads: consola de Upstash → Data Browser → `lead:*`, o `ZRANGE leads:index 0 -1`.

## Probar en local

```bash
cp env.example .env.local   # rellena los valores
npm run dev
# expón tu localhost con: npx localtunnel --port 3000  (o ngrok / cloudflared)
# y usa esa URL https como Callback URL temporal en Meta
```

## Costos
- **Claude**: depende de `CLAUDE_MODEL` (Haiku 4.5 por defecto). Cada mensaje es 1 request,
  o 2 si se guarda un lead. El tope diario corta en `CLAUDE_DAILY_LIMIT`.
- **WhatsApp Cloud API**: las conversaciones iniciadas por el usuario son gratuitas en la
  mayoría de países; las iniciadas con plantilla tienen costo.
- **Upstash / Vercel**: planes gratuitos suficientes para empezar.
