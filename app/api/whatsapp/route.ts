// Webhook de WhatsApp Business (Meta Cloud API) — Fase 1: verificación + recepción.
// GET: responde el challenge de verificación de Meta.
// POST: valida la firma (fail-closed), deduplica y registra los mensajes entrantes.
// El pipeline de respuesta (Claude + envío) llega en la Fase 2.
import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/whatsapp/verify";
import { claimMessage } from "@/lib/whatsapp/store";

export const runtime = "nodejs"; // la verificación HMAC usa node:crypto

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
  //    En Fase 2 el procesamiento se colgará aquí con `after(process(msg))`, tras el dedup.
  for (const msg of messages) {
    if (await claimMessage(msg.id)) {
      console.log("[whatsapp] mensaje entrante", {
        id: msg.id,
        from: msg.from,
        type: msg.type,
      });
    } else {
      console.log("[whatsapp] duplicado descartado", { id: msg.id });
    }
  }

  return NextResponse.json({ status: "received" });
}

// Aplana los mensajes entrantes del payload. Si un `change.value` no trae `messages`
// (p. ej. es un evento `statuses`), se salta: así queda filtrado sin enumerar tipos.
function extractMessages(payload: WhatsAppWebhookPayload): IncomingMessage[] {
  const out: IncomingMessage[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages) continue;
      for (const msg of value.messages) {
        out.push({ id: msg.id, from: msg.from, type: msg.type, text: msg.text?.body });
      }
    }
  }
  return out;
}

type IncomingMessage = { id: string; from: string; type: string; text?: string };

// Tipado mínimo del payload de Meta (solo lo que consumimos en esta fase).
type WhatsAppWebhookPayload = {
  entry?: {
    changes?: {
      value?: {
        messaging_product?: string;
        messages?: {
          id: string;
          from: string;
          type: string;
          text?: { body: string };
        }[];
        statuses?: unknown[];
      };
    }[];
  }[];
};
