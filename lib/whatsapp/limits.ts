// P0 de seguridad: rate limit por contacto (wa_id) + tope de presupuesto global.
// Ambos son contadores atómicos en Redis (INCR), evaluados ANTES de llamar a Claude.
// Fail-open: if Redis is down both checks allow the message (logged in `safely`).
// Accepted risk: while Redis is down there is no daily spending cap.
import { safely } from "./store";

const TIMEZONE = "America/Bogota";
const RL_MAX_PER_HOUR = Number(process.env.RL_MAX_PER_HOUR ?? 20);
const CLAUDE_DAILY_LIMIT = Number(process.env.CLAUDE_DAILY_LIMIT ?? 500);
const BUDGET_KEY_TTL = 60 * 60 * 48; // 48 h de margen

function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

type LimitCheck = { allowed: boolean; notifyOnce: boolean };

const ALLOW: LimitCheck = { allowed: true, notifyOnce: false };

/**
 * Rate limit por wa_id en ventana fija de 1 hora.
 * `notifyOnce` es true solo la primera vez que se excede en esa hora, para avisar
 * al usuario una única vez y callar en los mensajes siguientes.
 */
export async function checkRateLimit(waId: string): Promise<LimitCheck> {
  return safely("checkRateLimit", ALLOW, async (r) => {
    const bucket = Math.floor(Date.now() / 3_600_000); // hora epoch
    const key = `rl:${waId}:${bucket}`;
    const n = await r.incr(key);
    if (n === 1) await r.expire(key, 3600);
    if (n <= RL_MAX_PER_HOUR) return ALLOW;
    const first = await r.set(`rl:notified:${waId}`, "1", { nx: true, ex: 3600 });
    return { allowed: false, notifyOnce: first === "OK" };
  });
}

/**
 * Tope global diario de requests a Claude (corte duro). Reserva el PRIMER request del
 * mensaje; si el mensaje usa más (tool use con save_lead), el resto se suma después con
 * `addBudgetUsage`. Llamar solo cuando de verdad se va a invocar a Claude.
 * `notifyOnce` avisa al owner una sola vez por día al alcanzar el tope.
 */
export async function checkBudget(): Promise<LimitCheck> {
  return safely("checkBudget", ALLOW, async (r) => {
    const day = todayInBogota();
    const key = `budget:claude:${day}`;
    const n = await r.incr(key);
    if (n === 1) await r.expire(key, BUDGET_KEY_TTL);
    if (n <= CLAUDE_DAILY_LIMIT) return ALLOW;
    const first = await r.set(`budget:alerted:${day}`, "1", { nx: true, ex: BUDGET_KEY_TTL });
    return { allowed: false, notifyOnce: first === "OK" };
  });
}

/**
 * Counts the extra Claude requests a message used beyond the one `checkBudget`
 * reserved. Never blocks: at most the last message of the day overshoots the cap.
 */
export async function addBudgetUsage(extraRequests: number): Promise<void> {
  if (extraRequests <= 0) return;
  await safely("addBudgetUsage", undefined, async (r) => {
    const key = `budget:claude:${todayInBogota()}`;
    const n = await r.incrby(key, extraRequests);
    // The day may have rolled over since checkBudget: never leave a key without TTL.
    if (n === extraRequests) await r.expire(key, BUDGET_KEY_TTL);
  });
}
