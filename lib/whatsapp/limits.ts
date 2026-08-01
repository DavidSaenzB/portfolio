// P0 de seguridad: rate limit por contacto (wa_id) + tope de presupuesto global.
// Ambos son contadores atómicos en Redis (INCR), evaluados ANTES de llamar a Claude.
import { redis } from "./store";

const TIMEZONE = "America/Bogota";
const RL_MAX_PER_HOUR = Number(process.env.RL_MAX_PER_HOUR ?? 20);
const CLAUDE_DAILY_LIMIT = Number(process.env.CLAUDE_DAILY_LIMIT ?? 150);

function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

type LimitCheck = { allowed: boolean; notifyOnce: boolean };

/**
 * Rate limit por wa_id en ventana fija de 1 hora.
 * `notifyOnce` es true solo la primera vez que se excede en esa hora, para avisar
 * al usuario una única vez y callar en los mensajes siguientes.
 */
export async function checkRateLimit(waId: string): Promise<LimitCheck> {
  if (!redis) return { allowed: true, notifyOnce: false };
  const bucket = Math.floor(Date.now() / 3_600_000); // hora epoch
  const key = `rl:${waId}:${bucket}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 3600);
  if (n <= RL_MAX_PER_HOUR) return { allowed: true, notifyOnce: false };
  const first = await redis.set(`rl:notified:${waId}`, "1", { nx: true, ex: 3600 });
  return { allowed: false, notifyOnce: first === "OK" };
}

/**
 * Tope global diario de llamadas a Claude (corte duro). Cuenta 1 por mensaje que
 * llega hasta aquí (con las tools desactivadas, 1 mensaje = 1 request a Claude).
 * Llamar solo cuando de verdad se va a invocar a Claude, para no inflar el contador.
 * `notifyOnce` avisa al owner una sola vez por día al alcanzar el tope.
 */
export async function checkBudget(): Promise<LimitCheck> {
  if (!redis) return { allowed: true, notifyOnce: false };
  const day = todayInBogota();
  const key = `budget:claude:${day}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 60 * 60 * 48); // 48 h de margen
  if (n <= CLAUDE_DAILY_LIMIT) return { allowed: true, notifyOnce: false };
  const first = await redis.set(`budget:alerted:${day}`, "1", { nx: true, ex: 60 * 60 * 48 });
  return { allowed: false, notifyOnce: first === "OK" };
}
