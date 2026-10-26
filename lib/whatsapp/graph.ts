// Envío y estados vía WhatsApp Business Cloud API (Meta Graph API).
const GRAPH_API_VERSION = "v26.0";

// Graph error for free-form text sent outside the 24 h customer-service window.
const OUTSIDE_24H_WINDOW = 131047;

function graphErrorCode(body: string): number | undefined {
  try {
    const code = (JSON.parse(body) as { error?: { code?: unknown } }).error?.code;
    return typeof code === "number" ? code : undefined;
  } catch {
    return undefined;
  }
}

// Nunca lanza: los fallos de red/Graph se loguean y se degradan (invariante del pipeline).
// `label` identifica al llamador en los logs: sendText, markRead y notifyOwner comparten
// este endpoint y sin la etiqueta un error de Graph no se puede atribuir a ninguno.
async function graphSend(label: string, payload: Record<string, unknown>): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) {
    console.error("[whatsapp] faltan WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN");
    return;
  }
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 401) {
        console.error(
          "[whatsapp] 401 de Graph API: el WHATSAPP_ACCESS_TOKEN probablemente expiró " +
            "(el token de prueba de Meta dura 24 h). Genera uno permanente de System User.",
        );
      } else if (graphErrorCode(body) === OUTSIDE_24H_WINDOW) {
        console.error(
          `[whatsapp] Graph rechazó ${label} (131047): ese número no le escribe al bot hace ` +
            "más de 24 h y fuera de esa ventana solo se permiten plantillas aprobadas. " +
            "Si es notifyOwner, el aviso se perdió: escríbele al bot desde tu WhatsApp para " +
            "reabrir la ventana (los leads igual quedan en Redis).",
          body,
        );
      } else {
        console.error(`[whatsapp] error de Graph API en ${label}:`, res.status, body);
      }
    }
  } catch (err) {
    console.error(`[whatsapp] fallo de red enviando a Graph API en ${label}:`, err);
  }
}

/**
 * Envía un mensaje de texto. Trunca a 4096 chars (límite de la Cloud API).
 *
 * Rechaza destinatarios vacíos SIN llamar a Graph: `to` undefined desaparece al
 * serializar el JSON y Graph responde 400 "The parameter to is required" (code 100).
 * El tipo acepta `undefined` a propósito — el destinatario viene del webhook y el
 * compilador no puede garantizar que Meta lo haya mandado.
 */
export async function sendText(
  to: string | undefined,
  body: string,
  label = "sendText",
): Promise<void> {
  const recipient = to?.trim();
  if (!recipient) {
    console.error(`[whatsapp] ${label} abortado: destinatario vacío`, {
      to,
      preview: body.slice(0, 80),
    });
    return;
  }
  const text = body.length > 4096 ? body.slice(0, 4096) : body;
  await graphSend(label, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
    type: "text",
    text: { preview_url: false, body: text },
  });
}

/**
 * Marca el mensaje como leído (doble check azul) y muestra el indicador de escritura.
 * Mismo blindaje que `sendText`: sin `message_id` el payload deja de ser un acuse de
 * lectura válido y Graph lo evalúa como envío, pidiendo un `to` que este payload nunca lleva.
 */
export async function markRead(messageId: string | undefined): Promise<void> {
  const id = messageId?.trim();
  if (!id) {
    console.error("[whatsapp] markRead abortado: message_id vacío");
    return;
  }
  await graphSend("markRead", {
    messaging_product: "whatsapp",
    status: "read",
    message_id: id,
    typing_indicator: { type: "text" },
  });
}

/**
 * Aviso interno al dueño del negocio (leads, handoff, tope de presupuesto). Opcional.
 * Texto libre: solo llega si OWNER_WHATSAPP_NUMBER le escribió al bot en las últimas 24 h.
 */
export async function notifyOwner(body: string): Promise<void> {
  const owner = process.env.OWNER_WHATSAPP_NUMBER;
  if (!owner) return;
  await sendText(owner, body, "notifyOwner");
}
