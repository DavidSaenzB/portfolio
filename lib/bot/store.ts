// Almacenamiento del bot: Upstash Redis en producción, memoria en desarrollo.
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

// Fallback en memoria (solo sirve en `next dev`; en Vercel cada invocación es efímera)
const memory = new Map<string, { value: unknown; expiresAt: number | null }>();

async function kvGet<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(key)) ?? null;
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry.value as T;
}

async function kvSet(key: string, value: unknown, ttlSeconds?: number) {
  if (redis) {
    if (ttlSeconds) await redis.set(key, value, { ex: ttlSeconds });
    else await redis.set(key, value);
    return;
  }
  memory.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

// ---------- Deduplicación de mensajes (Meta reintenta si no recibe 200) ----------

export async function alreadyProcessed(messageId: string): Promise<boolean> {
  const key = `wa:seen:${messageId}`;
  if (await kvGet(key)) return true;
  await kvSet(key, 1, 60 * 60 * 24);
  return false;
}

// ---------- Historial de conversación ----------

export type ChatTurn = { role: "user" | "assistant"; content: string };

const HISTORY_LIMIT = 30; // turnos guardados por contacto

export async function getHistory(phone: string): Promise<ChatTurn[]> {
  return (await kvGet<ChatTurn[]>(`wa:hist:${phone}`)) ?? [];
}

export async function saveHistory(phone: string, turns: ChatTurn[]) {
  await kvSet(`wa:hist:${phone}`, turns.slice(-HISTORY_LIMIT), 60 * 60 * 24 * 30);
}

// ---------- Citas ----------

export type Appointment = {
  name: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  topic: string;
  createdAt: string;
};

export async function getAppointments(date: string): Promise<Appointment[]> {
  return (await kvGet<Appointment[]>(`wa:appts:${date}`)) ?? [];
}

export async function addAppointment(appt: Appointment) {
  const existing = await getAppointments(appt.date);
  await kvSet(`wa:appts:${appt.date}`, [...existing, appt]);
}

// ---------- Leads de ventas ----------

export type Lead = {
  name: string;
  contact: string;
  interest: string;
  details: string;
  phone: string;
  createdAt: string;
};

export async function addLead(lead: Lead) {
  const existing = (await kvGet<Lead[]>("wa:leads")) ?? [];
  await kvSet("wa:leads", [...existing, lead]);
}
