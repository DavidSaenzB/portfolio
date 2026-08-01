// Almacenamiento del bot en Upstash Redis.
// Fase 1: solo deduplicación de mensajes. En Fase 2 se amplía con historial y handoff.
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

/**
 * Reclama un message_id para procesarlo una sola vez (Meta reintenta si no recibe 200 rápido).
 * Devuelve true si es la primera vez que lo vemos (hay que procesarlo),
 * false si ya estaba reclamado (descartar duplicado).
 *
 * Sin Upstash configurado (dev local) NO deduplica: devuelve true siempre.
 */
export async function claimMessage(id: string): Promise<boolean> {
  if (!id) return false;
  if (!redis) return true; // dev sin Upstash: no hay dedup persistente
  const res = await redis.set(`dedup:${id}`, "1", { nx: true, ex: 86400 });
  return res === "OK";
}
