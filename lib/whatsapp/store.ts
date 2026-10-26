// Almacenamiento del bot en Upstash Redis: dedup + historial + handoff + leads.
// Cliente explícito con los nombres de variable que inyecta la integración de
// Vercel (UPSTASH_REDIS_KV_REST_API_*), NO Redis.fromEnv().
//
// Fail-open: every helper here logs and degrades instead of throwing. A Redis outage
// (like the archived database that answered ENOTFOUND) must never turn the webhook
// into a 500, because Meta retries non-200 responses in a loop.
import { Redis } from "@upstash/redis";
import type { Lead } from "./leads";

const url = process.env.UPSTASH_REDIS_KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;

// Per-command time budget. The dedup runs BEFORE the 200 to Meta, and the SDK default
// (5 retries with exponential backoff) stalls ~4 s on a dead host before failing.
// `signal` must be a FUNCTION: with a plain AbortSignal the SDK turns an abort into a
// fake successful result (the abort reason) instead of throwing.
const COMMAND_TIMEOUT_MS = 2000;

// Sin credenciales (dev local sin Upstash) el bot degrada a "sin persistencia":
// no deduplica, no recuerda historial y no hay handoff. Solo para pruebas locales.
export const redis =
  url && token
    ? new Redis({
        url,
        token,
        retry: { retries: 1, backoff: () => 100 },
        signal: () => AbortSignal.timeout(COMMAND_TIMEOUT_MS),
      })
    : null;

/** Runs a Redis operation without ever throwing: on failure it logs and returns `fallback`. */
export async function safely<T>(
  label: string,
  fallback: T,
  op: (r: Redis) => Promise<T>,
): Promise<T> {
  if (!redis) return fallback;
  try {
    return await op(redis);
  } catch (err) {
    console.error(`[whatsapp] Redis falló en ${label}; sigo sin él`, err);
    return fallback;
  }
}

// ---------- Deduplicación de mensajes (Meta reintenta si no recibe 200) ----------

/** true si es la primera vez que vemos este message_id (procesar); false si es duplicado. */
export async function claimMessage(id: string): Promise<boolean> {
  if (!id) return false;
  // Redis down → process the message without dedup rather than drop it or answer 500.
  return safely(
    "claimMessage",
    true,
    async (r) => (await r.set(`dedup:${id}`, "1", { nx: true, ex: 86400 })) === "OK",
  );
}

// ---------- Historial de conversación ----------

export type ChatTurn = { role: "user" | "assistant"; content: string };

const HISTORY_MAX = 40; // ≈ 20 turnos
const HISTORY_TTL = 60 * 60 * 24; // 24 h

export async function getHistory(waId: string): Promise<ChatTurn[]> {
  return safely("getHistory", [], async (r) => {
    const turns = await r.get<ChatTurn[]>(`chat:${waId}`);
    return Array.isArray(turns) ? turns : [];
  });
}

export async function saveHistory(waId: string, turns: ChatTurn[]): Promise<void> {
  await safely("saveHistory", undefined, async (r) => {
    await r.set(`chat:${waId}`, turns.slice(-HISTORY_MAX), { ex: HISTORY_TTL });
  });
}

// ---------- Handoff a humano ----------
// El flag lo activa/desactiva el endpoint admin (Fase 3). Aquí solo el storage
// y el check que consume el pipeline: si está activo, el bot calla.

const HANDOFF_TTL = 60 * 60 * 24; // 24 h

export async function isHandoffActive(waId: string): Promise<boolean> {
  // Redis down → assume no handoff and let the bot answer (Fase 4a decision): silence
  // for every contact is worse, and handoff can't be toggled without Redis anyway.
  return safely("isHandoffActive", false, async (r) => (await r.get(`human:${waId}`)) !== null);
}

export async function setHandoff(waId: string, enabled: boolean): Promise<void> {
  if (!redis) return;
  if (enabled) await redis.set(`human:${waId}`, "1", { ex: HANDOFF_TTL });
  else await redis.del(`human:${waId}`);
}

// ---------- Leads (tool save_lead) ----------
// One record per contact (upsert), expiring after 180 days as the privacy policy
// states (§4). The index only maps wa_id → timestamp and is pruned to the same
// window, so nothing outlives the TTL.

const LEAD_TTL = 60 * 60 * 24 * 180; // 180 days

export async function getLead(waId: string): Promise<Lead | null> {
  return safely("getLead", null, async (r) => (await r.get<Lead>(`lead:${waId}`)) ?? null);
}

/** true if the lead was persisted. */
export async function putLead(lead: Lead): Promise<boolean> {
  return safely("putLead", false, async (r) => {
    const now = Date.now();
    await r
      .multi()
      .set(`lead:${lead.waId}`, lead, { ex: LEAD_TTL })
      .zadd("leads:index", { score: now, member: lead.waId })
      .zremrangebyscore("leads:index", 0, now - LEAD_TTL * 1000)
      .expire("leads:index", LEAD_TTL)
      .exec();
    return true;
  });
}

// ---------- Keep-alive (Vercel Cron) ----------

/**
 * Daily write so Upstash doesn't archive the database for inactivity.
 * Unlike the helpers above it THROWS, so the cron route can report the failure.
 */
export async function pingRedis(): Promise<string> {
  if (!redis) throw new Error("Redis no configurado (faltan UPSTASH_REDIS_KV_REST_API_*)");
  const at = new Date().toISOString();
  await redis.set("health:redis-ping", at, { ex: 60 * 60 * 24 * 7 });
  return at;
}
