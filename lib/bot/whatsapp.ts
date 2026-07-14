// Envío de mensajes a través de la WhatsApp Business Cloud API (Meta Graph API).

const GRAPH_API_VERSION = "v23.0";

export async function sendWhatsAppText(to: string, body: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) {
    console.error("Faltan WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN");
    return;
  }

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body },
      }),
    },
  );

  if (!res.ok) {
    console.error("Error enviando mensaje de WhatsApp:", res.status, await res.text());
  }
}

/** Aviso interno al dueño del negocio (nueva cita o lead). Opcional. */
export async function notifyOwner(body: string) {
  const owner = process.env.OWNER_WHATSAPP_NUMBER;
  if (!owner) return;
  await sendWhatsAppText(owner, body);
}
