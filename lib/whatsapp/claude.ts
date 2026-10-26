// Llamada a Claude vía OrcAI (proxy de la API de Anthropic), con la tool save_lead.
//
// Manual, bounded tool loop instead of the beta toolRunner, for three reasons:
// - Fallback: if the proxy rejects the request with tools, the same turn is retried
//   without them, so the bot keeps answering (it just can't save leads).
// - Budget: every request counts against CLAUDE_DAILY_LIMIT and the loop knows exactly
//   how many it made.
// - No beta dependency.
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";
import { SAVE_LEAD_TOOL } from "./tools";
import { handleSaveLead, type Lead } from "./leads";
import type { ChatTurn } from "./store";

const TIMEZONE = "America/Bogota";
const MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";
const MAX_TOKENS = Number(process.env.CLAUDE_MAX_TOKENS ?? 600);

/** Hard cap of Claude requests per incoming message (normal: 1; with save_lead: 2). */
const MAX_REQUESTS = 3;
/** After the proxy rejects tools, skip them for a while in this instance to avoid paying twice. */
const TOOLS_COOLDOWN_MS = 10 * 60 * 1000;
let toolsDisabledUntil = 0;

// Fixed texts (no Claude involved), bilingual like the pipeline's canned messages.
const EMPTY_REPLY =
  "Sorry, I couldn't process your message. Could you say it again?\n\n" +
  "Lo siento, no pude procesar tu mensaje. ¿Puedes repetirlo?";
const LEAD_SAVED_REPLY =
  "Thanks! David will contact you by email or WhatsApp soon 🙌\n\n" +
  "¡Gracias! David te contacta por correo o WhatsApp muy pronto 🙌";

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

function buildSystem(existingLead: Lead | null): string {
  let system = `${SYSTEM_PROMPT}\n\nToday's date: ${todayInBogota()} (${TIMEZONE}).`;
  if (existingLead) {
    system +=
      `\n\nLead status: this contact's lead is already saved (name: ${existingLead.name}; ` +
      `interest: ${existingLead.interest}; email: ${existingLead.email ? "on file" : "not given"}). ` +
      "Don't ask again for details they already gave. Call save_lead again only if key details change.";
  }
  return system;
}

/** Errors that may mean "this endpoint doesn't accept tools". Confirmed only if the retry without tools works. */
function mayBeToolsRejection(err: unknown): boolean {
  return err instanceof Anthropic.APIError && [400, 404, 422, 501].includes(err.status ?? 0);
}

function extractText(res: Anthropic.Message): string {
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

export type ReplyInput = {
  waId: string;
  history: ChatTurn[];
  userText: string;
  existingLead: Lead | null;
};

export type ReplyResult = {
  text: string;
  /** Claude requests made (including failed ones), for the daily budget. */
  requests: number;
  leadSaved: boolean;
};

/** Genera la respuesta del bot para un mensaje entrante, dado el historial. */
export async function generateReply(input: ReplyInput): Promise<ReplyResult> {
  const messages: Anthropic.MessageParam[] = normalize([
    ...input.history,
    { role: "user", content: input.userText },
  ]);
  const base: Anthropic.MessageCreateParamsNonStreaming = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystem(input.existingLead),
    messages,
  };
  const state = { requests: 0, leadSaved: false };

  let res = await firstRequest(base, state);

  // Tool rounds. The follow-up must carry the tools again: the history now holds
  // tool_use/tool_result blocks, which the API rejects without a tools definition.
  while (res.stop_reason === "tool_use" && state.requests < MAX_REQUESTS) {
    const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUses) results.push(await runTool(block, input.waId, state));
    messages.push({ role: "assistant", content: res.content });
    messages.push({ role: "user", content: results });

    try {
      state.requests++;
      res = await client.messages.create({ ...base, tools: [SAVE_LEAD_TOOL] });
    } catch (err) {
      if (!state.leadSaved) throw err;
      // The lead is already stored: confirm with a fixed text instead of the generic fallback.
      console.error("[whatsapp] Claude falló después de guardar el lead", err);
      return { text: LEAD_SAVED_REPLY, ...state };
    }
  }

  const text = extractText(res);
  if (!text) {
    console.error("[whatsapp] Claude terminó sin texto", { stop_reason: res.stop_reason, ...state });
    return { text: state.leadSaved ? LEAD_SAVED_REPLY : EMPTY_REPLY, ...state };
  }
  return { text, ...state };
}

/** First request: with tools when available, falling back to a plain request if the proxy rejects them. */
async function firstRequest(
  base: Anthropic.MessageCreateParamsNonStreaming,
  state: { requests: number },
): Promise<Anthropic.Message> {
  if (Date.now() < toolsDisabledUntil) {
    state.requests++;
    return client.messages.create(base);
  }
  try {
    state.requests++;
    return await client.messages.create({ ...base, tools: [SAVE_LEAD_TOOL] });
  } catch (err) {
    if (!mayBeToolsRejection(err)) throw err;
    state.requests++;
    const res = await client.messages.create(base); // if this fails too, tools weren't the problem
    toolsDisabledUntil = Date.now() + TOOLS_COOLDOWN_MS;
    console.error(
      "[whatsapp] el proxy rechazó la request con tools; respondo sin tools " +
        "(save_lead apagado 10 min en esta instancia)",
      err,
    );
    return res;
  }
}

async function runTool(
  block: Anthropic.ToolUseBlock,
  waId: string,
  state: { leadSaved: boolean },
): Promise<Anthropic.ToolResultBlockParam> {
  if (block.name !== SAVE_LEAD_TOOL.name) {
    return {
      type: "tool_result",
      tool_use_id: block.id,
      content: `Unknown tool: ${block.name}`,
      is_error: true,
    };
  }
  const outcome = await handleSaveLead(waId, block.input);
  if (outcome.ok) state.leadSaved = true;
  else console.log("[whatsapp] save_lead rechazado", { waId, reason: outcome.message });
  return {
    type: "tool_result",
    tool_use_id: block.id,
    content: outcome.message,
    is_error: !outcome.ok,
  };
}
