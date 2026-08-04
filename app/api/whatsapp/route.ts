// Webhook de WhatsApp Business (Meta Cloud API).
// GET: responde el challenge de verificación de Meta.
// POST: valida la firma (fail-closed), deduplica y procesa los mensajes entrantes.
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { verifySignature } from "@/lib/whatsapp/verify";
import { claimMessage } from "@/lib/whatsapp/store";
import { processMessage, type IncomingMessage } from "@/lib/whatsapp/process";

export const runtime = "nodejs"; // la verificación HMAC usa node:crypto
export const maxDuration = 60; // el agente puede tardar varios segundos

// --- Verificación del webhook (Meta la llama una sola vez al configurarlo) ---
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 }); // texto plano
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// --- Recepción de mensajes ---
export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // CRUDO, antes de parsear (la firma es sobre este texto)

  // 1. Firma HMAC fail-closed: sin secret o firma inválida → 403.
  if (!verifySignature(rawBody, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Parsear el payload ya verificado.
  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // 3. Extraer solo mensajes entrantes (ignora los eventos `statuses` de entrega/lectura).
  const messages = extractMessages(payload);

  // 4. Deduplicar ANTES de responder 200 (Meta reintenta si tardamos o no confirmamos).
  //    El procesamiento corre post-respuesta con `after()`, tras el dedup.
  for (const msg of messages) {
    if (await claimMessage(msg.id)) {
      // Rastro mínimo de cada mensaje aceptado: sin esto un fallo posterior en el
      // pipeline no se puede atribuir a un tipo de mensaje ni a un remitente.
      console.log("[whatsapp] mensaje entrante", { id: msg.id, from: msg.from, type: msg.type });
      after(processMessage(msg));
    } else {
      console.log("[whatsapp] duplicado descartado", { id: msg.id });
    }
  }

  return NextResponse.json({ status: "received" });
}

// Aplana los mensajes entrantes del payload. Si un `change.value` no trae `messages`
// (p. ej. es un evento `statuses`), se salta: así queda filtrado sin enumerar tipos.
//
// El remitente se resuelve para CUALQUIER tipo de mensaje (texto, imagen, audio,
// sticker, ubicación…): `messages[].from` es la fuente normal y `contacts[0].wa_id`
// el respaldo cuando Meta manda el mensaje sin `from`. Un mensaje sin remitente
// resoluble se descarta aquí — si pasara, el pipeline terminaría llamando a Graph
// con `to` vacío y Graph responde 400 (code 100, "The parameter to is required").
function extractMessages(payload: WhatsAppWebhookPayload): IncomingMessage[] {
  const out: IncomingMessage[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages) continue;
      const fallbackWaId = value.contacts?.[0]?.wa_id?.trim();
      for (const msg of value.messages) {
        const id = msg.id?.trim();
        const from = msg.from?.trim() || fallbackWaId;
        const type = msg.type ?? "unknown";
        if (!id || !from) {
          console.error("[whatsapp] mensaje descartado sin id o sin remitente resoluble", {
            id: msg.id,
            from: msg.from,
            type: msg.type,
            hasContacts: Boolean(value.contacts?.length),
          });
          continue;
        }
        out.push({ id, from, type, text: msg.text?.body });
      }
    }
  }
  return out;
}

// Tipado mínimo del payload de Meta (solo lo que consumimos). Todo opcional a
// propósito: es entrada externa y el runtime no la garantiza aunque los docs sí.
type WhatsAppWebhookPayload = {
  entry?: {
    changes?: {
      value?: {
        messaging_product?: string;
        contacts?: { wa_id?: string; profile?: { name?: string } }[];
        messages?: {
          id?: string;
          from?: string;
          type?: string;
          text?: { body: string };
        }[];
        statuses?: unknown[];
      };
    }[];
  }[];
};
