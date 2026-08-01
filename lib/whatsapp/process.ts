// Pipeline por mensaje entrante. Corre post-respuesta (bajo `after()` en route.ts),
// tras la validación de firma y el dedup. Orden: handoff → rate limit → budget → Claude.
// Las tres barreras cortan ANTES de gastar una llamada paga.
import { markRead, sendText, notifyOwner } from "./graph";
import { getHistory, saveHistory, isHandoffActive } from "./store";
import { checkRateLimit, checkBudget } from "./limits";
import { generateReply } from "./claude";

export type IncomingMessage = { id: string; from: string; type: string; text?: string };

const MSG_FALLBACK =
  "Lo siento, tuve un problema técnico. Intenta de nuevo en un momento o escribe a hire@davidsaenz.dev.";
const MSG_BUSY =
  "Ahora mismo no puedo atenderte por chat. Escríbeme a hire@davidsaenz.dev y te respondo pronto 🙌";
const MSG_RATE = "Estás enviando mensajes muy rápido 🙏 Dame un momento y seguimos.";

export async function processMessage(msg: IncomingMessage): Promise<void> {
  const { id, from, type, text } = msg;
  if (type !== "text" || !text) return; // v1: solo texto

  try {
    await markRead(id);

    // 1. Handoff activo → guardar el mensaje, avisar al dueño y NO responder.
    if (await isHandoffActive(from)) {
      const history = await getHistory(from);
      await saveHistory(from, [...history, { role: "user", content: text }]);
      await notifyOwner(`✋ (handoff activo) ${from}:\n${text}`);
      return;
    }

    // 2. Rate limit por contacto.
    const rl = await checkRateLimit(from);
    if (!rl.allowed) {
      if (rl.notifyOnce) await sendText(from, MSG_RATE);
      return;
    }

    // 3. Tope de presupuesto global (cuenta la llamada a Claude que sigue).
    const budget = await checkBudget();
    if (!budget.allowed) {
      if (budget.notifyOnce) {
        await notifyOwner(
          "⚠️ Tope diario de Claude alcanzado. El bot responde con el mensaje de fallback hasta mañana.",
        );
      }
      await sendText(from, MSG_BUSY);
      return;
    }

    // 4. Historial → Claude → responder → guardar.
    const history = await getHistory(from);
    const reply = await generateReply(history, text);
    await sendText(from, reply);
    await saveHistory(from, [
      ...history,
      { role: "user", content: text },
      { role: "assistant", content: reply },
    ]);
  } catch (err) {
    console.error("[whatsapp] error procesando", id, err);
    await sendText(from, MSG_FALLBACK);
  }
}
