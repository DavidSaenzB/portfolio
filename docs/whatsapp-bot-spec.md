# Spec v2 — Bot de WhatsApp integrado en davidsaenz.dev

**Estado:** diseño cerrado, listo para implementar por fases con Claude Code.
**Stack:** WhatsApp Cloud API (Meta) · Next.js API Routes (Node runtime) · Claude API · Upstash Redis · Vercel (Fluid Compute).
**Hereda de:** spec v1 (FastAPI + Railway, junio 2026). Las decisiones de diseño se mantienen; solo cambia la plataforma de ejecución.

## 1. Contexto y decisión

El bot atiende leads que llegan desde davidsaenz.dev (negocio propio de David, no producto
para clientes). Hace conversación libre con IA (Claude) + captura de lead: nombre,
empresa/proyecto, qué necesita, plazo. El conocimiento del negocio vive en el system
prompt (Anexo A) mientras el catálogo sea acotado.

**Decisión:** integrado al portfolio como API routes en el mismo deploy de Vercel.
Motivos: volumen bajo, cero infraestructura nueva, credenciales como env vars de Vercel,
y se construye sobre lo que ya está corriendo. **Criterio de extracción:** si el bot se
convierte en producto para clientes (multi-tenant, colas, SLA), se extrae al servicio
standalone FastAPI + Railway ya diseñado en el spec v1 — nada de lo de aquí lo impide.

## 2. Flujo de un mensaje

```
Cliente WhatsApp
   │
   ▼
Meta Cloud API ──POST──▶ /api/whatsapp (route handler, Node runtime)
                            │ 1. lee RAW body y valida firma HMAC
                            │ 2. filtra statuses (solo messages[])
                            │ 3. dedup por message_id (Upstash SET NX EX)
                            │ 4. waitUntil(process(msg)) y responde 200 (< 1 s)
                            ▼
                      process() — corre post-respuesta (Fluid Compute)
                ┌───────────────┼──────────────┐
                ▼               ▼              ▼
        Upstash Redis       Claude API     (fase 5: Postgres auditoría)
        (contexto/handoff)      │
                                ▼
                      Graph API /messages ──▶ Cliente
                      (+ mark read + typing indicator)
```

## 3. Invariantes NO negociables (portados del spec v1)

1. La validación HMAC usa el **raw body** (`await req.text()` ANTES de parsear).
   JSON re-serializado rompe la firma. Header: `X-Hub-Signature-256`,
   `sha256=HMAC_SHA256(META_APP_SECRET, raw)`. Comparación en tiempo constante. 403 si falla.
2. `POST /api/whatsapp` responde 200 rápido: validar → dedup → `waitUntil` → return.
   Nunca procesar antes de responder — Meta reintenta webhooks lentos y duplica.
3. Dedup: `SET dedup:{message_id} "1" NX EX 86400`. Si ya existía, descartar.
4. Ignorar eventos `statuses` (confirmaciones de entrega/lectura); procesar solo
   `entry[].changes[].value.messages[]`.
5. Si `human:{wa_id}` está activo en Redis: guardar, notificar a `OWNER_WA_ID`,
   y **no responder**. Nunca saltarse este check.
6. Historial: lista `chat:{wa_id}` con JSON `{role, content}`, últimos
   `HISTORY_MAX_MESSAGES` (40 ≈ 20 turnos), TTL 24h. Antes de llamar a Claude,
   normalizar: primer turno siempre `user`, fusionar turnos consecutivos del mismo rol.
7. Respuestas del bot en el idioma del cliente (español por defecto), estilo WhatsApp
   (cortas, `*negrilla*`/`_cursiva_`, nada de Markdown), truncadas a 4096 chars.
8. Llamadas externas (Graph API, Claude) nunca tumban el pipeline: try/catch, log,
   degradar con el mensaje de fallback.

## 4. Estructura de archivos objetivo

```
app/api/whatsapp/route.ts         # GET verificación + POST webhook
app/api/whatsapp/admin/route.ts   # handoff on/off (fase 3, protegido con ADMIN_TOKEN)
lib/whatsapp/verify.ts            # firma HMAC
lib/whatsapp/store.ts             # Upstash: dedup, historial, handoff
lib/whatsapp/claude.ts            # llamada a Claude + normalización + fallback
lib/whatsapp/graph.ts             # sendText, markRead(+typing), notifyOwner
lib/whatsapp/process.ts           # pipeline por mensaje
lib/whatsapp/prompt.ts            # system prompt (Anexo A)
components/whatsapp-button.tsx    # botón flotante wa.me (fase 4)
docs/whatsapp-bot-spec.md         # este documento
```

Dependencias nuevas permitidas: `@anthropic-ai/sdk`, `@upstash/redis`, `@vercel/functions`.

## 5. Snippets de referencia (las partes fáciles de hacer mal)

```ts
// app/api/whatsapp/route.ts — el ORDEN importa
import { waitUntil } from "@vercel/functions";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  if (p.get("hub.mode") === "subscribe" &&
      p.get("hub.verify_token") === process.env.META_VERIFY_TOKEN) {
    return new Response(p.get("hub.challenge") ?? "", { status: 200 }); // texto plano
  }
  return new Response("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();                                  // RAW, antes de parsear
  if (!validSignature(raw, req.headers.get("x-hub-signature-256")))
    return new Response("invalid signature", { status: 403 });
  const payload = JSON.parse(raw);
  for (const { msg, contactName } of extractMessages(payload)) { // ignora statuses
    if (await claimMessage(msg.id))                              // dedup
      waitUntil(processMessage(msg, contactName));               // post-respuesta
  }
  return Response.json({ status: "received" });                  // 200 inmediato
}
```

```ts
// lib/whatsapp/verify.ts
import { createHmac, timingSafeEqual } from "node:crypto";

export function validSignature(raw: string, header: string | null): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", process.env.META_APP_SECRET!)
    .update(raw).digest("hex");
  const given = header.slice(7);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
}
```

```ts
// lib/whatsapp/store.ts — dedup con Upstash
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL + _TOKEN

export async function claimMessage(id: string): Promise<boolean> {
  if (!id) return false;
  return (await redis.set(`dedup:${id}`, "1", { nx: true, ex: 86400 })) === "OK";
}
```

Graph API: base `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}`,
header `Authorization: Bearer ${META_ACCESS_TOKEN}`. `markRead` acepta
`"typing_indicator": {"type": "text"}` en el mismo payload del status read.

## 6. Variables de entorno (Vercel → Settings → Environment Variables)

```
META_VERIFY_TOKEN       # string que David inventa, igual en la config del webhook
META_APP_SECRET         # App Dashboard → Settings → Basic
META_ACCESS_TOKEN       # token permanente (System User) — temporal de 24h para dev
PHONE_NUMBER_ID         # WhatsApp → API Setup (NO es el número de teléfono)
GRAPH_API_VERSION=v23.0
ANTHROPIC_API_KEY
CLAUDE_MODEL=claude-haiku-4-5
CLAUDE_MAX_TOKENS=600
UPSTASH_REDIS_REST_URL   # las inyecta la integración Upstash del marketplace de Vercel
UPSTASH_REDIS_REST_TOKEN
ADMIN_TOKEN              # para /api/whatsapp/admin
OWNER_WA_ID              # WhatsApp personal de David para notificaciones de handoff
HISTORY_MAX_MESSAGES=40
```

## 7. Fases (una fase = una sesión de CC = una rama = un PR)

**Fase 0 — Sanear el repo (ejecuta David; CC solo verifica).**
Eliminar el `.git` externo roto (el remoto ya tiene el código real vía `my-project`) y
quedarse con `my-project` como único repo de trabajo; resolver el `testimonials.tsx`
sin commitear; limpiar `.DS_Store`; corregir el README (Next 14 → 15).
*Done:* un solo `.git`, `git status` limpio, Vercel sigue desplegando normal.

**Fase 1 — Esqueleto del webhook.**
`route.ts` con GET de verificación + POST con HMAC + log del payload + 200. Env vars de
Meta en Vercel. Probar con el número de prueba de Meta.
*Done:* Meta verifica el webhook y los POST llegan con firma válida (visible en logs de Vercel).

**Fase 2 — El cerebro.**
Integración Upstash (marketplace), `store.ts` (dedup + historial), `claude.ts`,
`graph.ts` (sendText + markRead/typing), `process.ts` con el pipeline completo y
fallback ante errores. Filtro de statuses.
*Done:* conversación real ida y vuelta en WhatsApp, con contexto entre mensajes.

**Fase 3 — Handoff a humano.**
Flag `human:{wa_id}` (TTL 24h), notificación a `OWNER_WA_ID`, endpoint admin
(POST/GET `/api/whatsapp/admin?wa_id=...&enabled=...` con header `X-Admin-Token`).
*Done:* con handoff activo el bot calla y David recibe el mensaje reenviado.

**Fase 4 — Conectar la página.**
`components/whatsapp-button.tsx`: botón flotante con link `wa.me/<número>?text=...`
prellenado, textos vía `locales/` (ES/EN), estilo consistente con el sitio.
*Done:* botón visible en davidsaenz.dev abriendo chat con el bot.

**Fase 5 (opcional, después) — Auditoría permanente.**
Postgres (Neon vía marketplace), tabla `wa_messages(wa_id, direction, message_id,
body, created_at)`, escritura fail-open desde `process.ts`.

## 8. Riesgos aceptados en v1

- `waitUntil` es fire-and-forget sin retry: si el proceso muere post-respuesta, ese
  mensaje se pierde (mismo perfil de riesgo que BackgroundTasks en el spec v1). Aceptado
  por volumen bajo.
- Dos mensajes muy seguidos del mismo cliente pueden procesarse concurrentes e
  intercalar historial (no hay lock cross-invocación). Aceptado en v1; si molesta,
  agregar lock `SET NX` con TTL corto en Redis (fase posterior).
- Sin auditoría permanente hasta la fase 5 (el historial en Redis expira a las 24h).

## 9. Cómo trabajar cada fase con Claude Code

Prompt de arranque sugerido por sesión:
> Lee CLAUDE.md y docs/whatsapp-bot-spec.md. Vamos a ejecutar la **Fase N**. Propón el
> plan de archivos y cambios antes de escribir código, espera mi OK, implementa, corre
> `npm run build`, y repórtame qué quedó listo para commitear. No toques git.

---

## Anexo A — System prompt del bot (portar tal cual a `lib/whatsapp/prompt.ts`)

Eres el asistente virtual de David Sáenz (davidsaenz.dev), desarrollador full-stack
e integrador de IA basado en Cali, Colombia. Atiendes por WhatsApp a personas que
llegan desde su página web, casi siempre interesadas en contratar sus servicios.

**Servicios de David:** integraciones de IA con la API de Claude (chatbots, asistentes,
automatizaciones); procesamiento inteligente de documentos (extracción de datos de
facturas, auditoría de documentos financieros); bots de WhatsApp y Telegram; desarrollo
full-stack (FastAPI/Go, React/TypeScript, PostgreSQL, AWS). Mercado principal: LATAM
(español), también trabaja en inglés.

**Tu objetivo:** (1) responder dudas sobre los servicios de forma clara y honesta;
(2) capturar la información del lead de forma natural, no como formulario: nombre,
empresa o proyecto, qué necesita, plazo aproximado; (3) cuando haya interés real,
ofrecer que David lo contacte directamente. <!-- TODO: link de agenda si David define uno -->

**Reglas:** responde SIEMPRE en el idioma del cliente (español por defecto); estilo
WhatsApp: 2-4 frases, tono cercano y profesional, formato solo `*negrilla*`/`_cursiva_`;
NUNCA inventes precios, plazos ni tecnologías — los precios los confirma David según el
alcance; no prometas fechas de entrega; si piden hablar con una persona, dilo con
naturalidad: David puede escribirles por este mismo chat; no compartas información
personal de David más allá de lo público en davidsaenz.dev; ante spam u ofensas,
responde una sola vez con cortesía y brevedad.

**Contexto útil:** portafolio davidsaenz.dev (PyNova, CriptoDss, FacturAI, AuditAI,
ThoraxAI); zona horaria America/Bogota (UTC-5).
