# 🤖 Chatbot de WhatsApp Business con Claude

Bot integrado en este proyecto Next.js. Responde FAQs sobre los servicios de David, agenda citas, capta leads de ventas y mantiene conversación libre con IA (Claude).

## Arquitectura

```
WhatsApp → Meta Cloud API → POST /api/whatsapp (webhook en Vercel)
                                   │
                                   ├─ lib/bot/agent.ts    → Claude (claude-opus-4-8) + herramientas
                                   ├─ lib/bot/store.ts    → Upstash Redis (historial, citas, leads)
                                   └─ lib/bot/whatsapp.ts → respuesta vía Graph API
```

Herramientas del agente:
- `get_available_slots` — consulta franjas libres (L-V, 9:00–17:00 Colombia, sin las 12:00–14:00).
- `book_appointment` — agenda la cita y te avisa por WhatsApp (si configuras `OWNER_WHATSAPP_NUMBER`).
- `save_lead` — guarda interesados en contratar y te avisa.

## Configuración paso a paso

### 1. Claude API
1. Crea una API key en https://platform.claude.com → `ANTHROPIC_API_KEY`.

### 2. Meta / WhatsApp Business
1. Entra a https://developers.facebook.com → **My Apps → Create App** → tipo **Business**.
2. Agrega el producto **WhatsApp** a la app. Meta te da un **número de prueba** gratuito y un token temporal (24h) para desarrollar.
3. Copia:
   - **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **Token de acceso** → `WHATSAPP_ACCESS_TOKEN` (para producción crea un *System User* en Business Settings y genera un token permanente con permiso `whatsapp_business_messaging`)
   - **App Secret** (App Settings → Basic) → `WHATSAPP_APP_SECRET`
4. Inventa un token de verificación cualquiera → `WHATSAPP_VERIFY_TOKEN`.

### 3. Upstash Redis (persistencia)
1. En Vercel: **Storage → Marketplace → Upstash Redis** (plan gratuito), o directo en https://upstash.com.
2. Copia `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
3. Sin estas variables el bot funciona igual pero sin memoria persistente (solo para pruebas locales).

### 4. Desplegar y conectar el webhook
1. Añade todas las variables de `env.example` en Vercel (**Settings → Environment Variables**) y despliega.
2. En Meta: **WhatsApp → Configuration → Webhook**:
   - **Callback URL**: `https://www.davidsaenz.dev/api/whatsapp`
   - **Verify token**: el mismo valor de `WHATSAPP_VERIFY_TOKEN`
   - Dale a **Verify and save** (Meta hace un GET que este proyecto ya responde).
3. En **Webhook fields** suscríbete a `messages`.
4. Escribe al número de prueba desde tu WhatsApp y el bot responde. 🎉

### 5. Pasar a producción (número real)
- Verifica tu negocio en Meta Business Manager y registra tu número propio (no puede estar activo en la app normal de WhatsApp).
- Nota: con la Cloud API, el bot puede responder libremente dentro de las **24 horas** siguientes al último mensaje del usuario; fuera de esa ventana solo se pueden enviar plantillas aprobadas.

## Probar en local

```bash
cp env.example .env.local   # rellena los valores
npm run dev
# expón tu localhost con: npx localtunnel --port 3000  (o ngrok / cloudflared)
# y usa esa URL https como Callback URL temporal en Meta
```

## Costos aproximados
- **Claude** (`claude-opus-4-8`): $5 entrada / $25 salida por millón de tokens. Una conversación típica de WhatsApp gasta centavos. Si el volumen crece, se puede bajar a `claude-sonnet-5` o `claude-haiku-4-5` cambiando `MODEL` en `lib/bot/agent.ts`.
- **WhatsApp Cloud API**: las conversaciones iniciadas por el usuario (service) son gratuitas en la mayoría de países; las iniciadas por plantilla tienen costo.
- **Upstash / Vercel**: planes gratuitos suficientes para empezar.

## Datos guardados en Redis
- `wa:hist:{telefono}` — historial de conversación (últimos 30 turnos, expira a 30 días).
- `wa:appts:{fecha}` — citas del día.
- `wa:leads` — lista de leads captados.
