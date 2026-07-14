// Webhook de WhatsApp Business (Meta Cloud API).
// GET: verificación del webhook. POST: recepción de mensajes.
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import crypto from "crypto";
import { runAgent } from "@/lib/bot/agent";
import { sendWhatsAppText } from "@/lib/bot/whatsapp";
import { alreadyProcessed } from "@/lib/bot/store";

export const maxDuration = 60; // el agente puede tardar varios segundos

// --- Verificación inicial del webhook (Meta la llama una sola vez al configurarlo) ---
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// --- Recepción de mensajes ---
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Validar la firma de Meta (X-Hub-Signature-256) si hay APP_SECRET configurado
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (appSecret) {
    const signature = req.headers.get("x-hub-signature-256") ?? "";
    const expected =
      "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
    const valid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) {
      return new NextResponse("Invalid signature", { status: 401 });
    }
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  // Extraer mensajes de texto entrantes (ignora estados de entrega, reacciones, etc.)
  const incoming: { id: string; from: string; text: string }[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const msg of change.value?.messages ?? []) {
        if (msg.type === "text" && msg.text?.body) {
          incoming.push({ id: msg.id, from: msg.from, text: msg.text.body });
        }
      }
    }
  }

  // Responder 200 de inmediato y procesar después (Meta reintenta si tardamos)
  after(async () => {
    for (const msg of incoming) {
      try {
        if (await alreadyProcessed(msg.id)) continue;
        const reply = await runAgent(msg.from, msg.text);
        await sendWhatsAppText(msg.from, reply);
      } catch (error) {
        console.error("Error procesando mensaje de WhatsApp:", error);
        await sendWhatsAppText(
          msg.from,
          "Lo siento, tuve un problema técnico. Intenta de nuevo en un momento o escribe a hire@davidsaenz.dev.",
        );
      }
    }
  });

  return NextResponse.json({ status: "ok" });
}

// --- Tipado mínimo del payload de Meta ---
type WhatsAppWebhookPayload = {
  entry?: {
    changes?: {
      value?: {
        messages?: {
          id: string;
          from: string;
          type: string;
          text?: { body: string };
        }[];
      };
    }[];
  }[];
};
