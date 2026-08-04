// Pipeline por mensaje entrante. Corre post-respuesta (bajo `after()` en route.ts),
// tras la validación de firma y el dedup.
// Orden: handoff → rate limit → tipo soportado → budget → Claude.
// Las cuatro barreras cortan ANTES de gastar una llamada paga.
import { markRead, sendText, notifyOwner } from "./graph";
import { getHistory, saveHistory, isHandoffActive } from "./store";
import { checkRateLimit, checkBudget } from "./limits";
import { generateReply } from "./claude";

export type IncomingMessage = { id: string; from: string; type: string; text?: string };

// Mensajes enlatados: los emite el pipeline, no Claude, así que no pueden espejar el
// idioma del cliente (la regla de idioma vive en el system prompt y varios de estos
// salen sin haber llamado a Claude). Van bilingües, inglés primero: el bot hace default
// a inglés por el mercado US y atiende igual a quien escriba en español.
const MSG_FALLBACK =
  "Sorry, I ran into a technical problem. Try again in a moment, or email hire@davidsaenz.dev.\n\n" +
  "Lo siento, tuve un problema técnico. Intenta de nuevo en un momento o escribe a hire@davidsaenz.dev.";
const MSG_BUSY =
  "I can't take chats right now. Email me at hire@davidsaenz.dev and I'll get back to you soon 🙌\n\n" +
  "Ahora mismo no puedo atenderte por chat. Escríbeme a hire@davidsaenz.dev y te respondo pronto 🙌";
const MSG_RATE =
  "You're sending messages a bit too fast 🙏 Give me a moment and we'll continue.\n\n" +
  "Estás enviando mensajes muy rápido 🙏 Dame un momento y seguimos.";
const MSG_UNSUPPORTED =
  "For now I can only read text messages 🙏 Could you type it out?\n\n" +
  "Por ahora solo puedo leer mensajes de texto 🙏 ¿Me lo escribes?";

export async function processMessage(msg: IncomingMessage): Promise<void> {
  const { id, from, type, text } = msg;
  // Sin remitente no hay a quién responder: cortar antes de tocar Graph. `route.ts` ya
  // filtra estos casos; esto blinda a `processMessage` para cualquier otro llamador.
  if (!from) {
    console.error("[whatsapp] mensaje sin remitente, descartado", { id, type });
    return;
  }

  try {
    await markRead(id);

    // 1. Handoff activo → guardar el mensaje, avisar al dueño y NO responder.
    if (await isHandoffActive(from)) {
      const content = text ?? `[${type}]`; // los no-texto quedan como marcador en el historial
      const history = await getHistory(from);
      await saveHistory(from, [...history, { role: "user", content }]);
      await notifyOwner(`✋ (handoff activo) ${from}:\n${content}`);
      return;
    }

    // 2. Rate limit por contacto.
    const rl = await checkRateLimit(from);
    if (!rl.allowed) {
      if (rl.notifyOnce) await sendText(from, MSG_RATE);
      return;
    }

    // 3. v1 solo entiende texto. Los demás tipos (imagen, audio, sticker, ubicación,
    //    contacto…) no se ignoran en silencio: se acusan, se responde explicando el
    //    límite y se sale sin gastar una llamada a Claude.
    if (type !== "text" || !text) {
      console.log("[whatsapp] tipo no soportado", { id, type });
      await sendText(from, MSG_UNSUPPORTED);
      return;
    }

    // 4. Tope de presupuesto global (cuenta la llamada a Claude que sigue).
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

    // 5. Historial → Claude → responder → guardar.
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
