// Llamada a Claude vía OrcAI (proxy de la API de Anthropic).
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";
import type { ChatTurn } from "./store";

const TIMEZONE = "America/Bogota";
const MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";
const MAX_TOKENS = Number(process.env.CLAUDE_MAX_TOKENS ?? 600);

// baseURL apunta a OrcAI; si no está definido, el SDK usa el endpoint por defecto.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
});

function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

// Anthropic exige que el primer turno sea "user" y que los roles alternen.
// Normaliza: descarta turnos "assistant" iniciales y fusiona turnos consecutivos
// del mismo rol en uno solo.
function normalize(turns: ChatTurn[]): ChatTurn[] {
  const out: ChatTurn[] = [];
  for (const t of turns) {
    if (out.length === 0 && t.role !== "user") continue;
    const last = out[out.length - 1];
    if (last && last.role === t.role) last.content += `\n${t.content}`;
    else out.push({ role: t.role, content: t.content });
  }
  return out;
}

/** Genera la respuesta del bot para un mensaje entrante, dado el historial. */
export async function generateReply(
  history: ChatTurn[],
  userText: string,
): Promise<string> {
  const messages = normalize([...history, { role: "user", content: userText }]);

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: `${SYSTEM_PROMPT}\n\nFecha de hoy: ${todayInBogota()} (${TIMEZONE}).`,
    messages,
    // ── Tools de agendamiento DESACTIVADAS ────────────────────────────────────
    // El bot v1 arranca magro (captura conversacional de leads). Las tools
    // get_available_slots / book_appointment / save_lead viven, listas, en
    // ./tools.ts. Para reactivarlas cuando el cliente lo necesite:
    //   import { buildTools } from "./tools";
    //   const finalMessage = await client.beta.messages.toolRunner({
    //     model: MODEL, max_tokens: MAX_TOKENS, system: [...],
    //     tools: buildTools(waId), messages,
    //   });
    // (pasa el wa_id a generateReply y cambia messages.create por el toolRunner.)
    // ──────────────────────────────────────────────────────────────────────────
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return text || "Lo siento, no pude procesar tu mensaje. ¿Puedes repetirlo?";
}
