// Almacenamiento del bot en Upstash Redis: dedup + historial + handoff.
// Cliente explícito con los nombres de variable que inyecta la integración de
// Vercel (UPSTASH_REDIS_KV_REST_API_*), NO Redis.fromEnv().
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;

// Sin credenciales (dev local sin Upstash) el bot degrada a "sin persistencia":
// no deduplica, no recuerda historial y no hay handoff. Solo para pruebas locales.
export const redis = url && token ? new Redis({ url, token }) : null;

// ---------- Deduplicación de mensajes (Meta reintenta si no recibe 200) ----------

/** true si es la primera vez que vemos este message_id (procesar); false si es duplicado. */
export async function claimMessage(id: string): Promise<boolean> {
  if (!id) return false;
  if (!redis) return true; // dev sin Upstash: no hay dedup persistente
  const res = await redis.set(`dedup:${id}`, "1", { nx: true, ex: 86400 });
  return res === "OK";
}

// ---------- Historial de conversación ----------

export type ChatTurn = { role: "user" | "assistant"; content: string };

const HISTORY_MAX = 40; // ≈ 20 turnos
const HISTORY_TTL = 60 * 60 * 24; // 24 h

export async function getHistory(waId: string): Promise<ChatTurn[]> {
  if (!redis) return [];
  return (await redis.get<ChatTurn[]>(`chat:${waId}`)) ?? [];
}

export async function saveHistory(waId: string, turns: ChatTurn[]): Promise<void> {
  if (!redis) return;
  await redis.set(`chat:${waId}`, turns.slice(-HISTORY_MAX), { ex: HISTORY_TTL });
}

// ---------- Handoff a humano ----------
// El flag lo activa/desactiva el endpoint admin (Fase 3). Aquí solo el storage
// y el check que consume el pipeline: si está activo, el bot calla.

const HANDOFF_TTL = 60 * 60 * 24; // 24 h

export async function isHandoffActive(waId: string): Promise<boolean> {
  if (!redis) return false;
  return (await redis.get(`human:${waId}`)) !== null;
}

export async function setHandoff(waId: string, enabled: boolean): Promise<void> {
  if (!redis) return;
  if (enabled) await redis.set(`human:${waId}`, "1", { ex: HANDOFF_TTL });
  else await redis.del(`human:${waId}`);
}
