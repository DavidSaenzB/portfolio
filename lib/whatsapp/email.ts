// Correo de cada lead vía Resend (PR B de la Fase 4a). Se registra en LEAD_NOTIFIERS
// (leads.ts) junto al aviso por WhatsApp.
// Email doesn't depend on WhatsApp's 24 h window (Graph error 131047), so this is the
// channel that always reaches David. Fail-open: it never throws; a missing key, a
// non-2xx answer or a timeout only logs. Native fetch, no SDK (no new dependency).
import { CONTACT_EMAIL, PACKAGES } from "./catalog";
import type { Lead } from "./leads";

const RESEND_URL = "https://api.resend.com/emails";
const FROM = "Bot David <bot@davidsaenz.dev>";
const TIMEOUT_MS = 5000;
const TIMEZONE = "America/Bogota";

function packageLabel(interest: Lead["interest"]): string {
  return PACKAGES.find((p) => p.id === interest)?.name ?? "A medida";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Header-safe: client text must not carry line breaks or control chars into the subject. */
function oneLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

function formatBogota(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const formatted = new Intl.DateTimeFormat("es-CO", {
    timeZone: TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
  return `${formatted} (hora de Bogotá)`;
}

type LeadEmail = { subject: string; text: string; html: string };

export function buildLeadEmail(lead: Lead, isNew: boolean): LeadEmail {
  const kind = isNew ? "Nuevo lead" : "Lead actualizado";
  const pkg = packageLabel(lead.interest);
  const waLink = `https://wa.me/${lead.waId.replace(/\D/g, "")}`;
  const fields: [string, string][] = [
    ["Tipo", kind],
    ["Nombre", lead.name],
    ["Email", lead.email ?? "(no lo dio)"],
    ["Teléfono", lead.phone],
    ["WhatsApp (wa_id)", lead.waId],
    ["Interés", pkg],
    ["Creado", formatBogota(lead.createdAt)],
    ["Actualizado", formatBogota(lead.updatedAt)],
  ];
  const replyHint = lead.email
    ? "Responder este correo le escribe directamente al cliente."
    : "El cliente no dio email: contáctalo por WhatsApp.";

  const subject = oneLine(`${isNew ? "🔔 Nuevo lead" : "🔁 Lead actualizado"} — ${pkg} — ${lead.name}`);

  const text = [
    ...fields.map(([label, value]) => `${label}: ${value}`),
    `Abrir chat: ${waLink}`,
    "",
    "Resumen:",
    lead.summary,
    "",
    replyHint,
  ].join("\n");

  // Everything interpolated into the HTML is escaped: name, email, phone and summary
  // come from the client (through the model).
  const rows = fields
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#555"><b>${escapeHtml(label)}</b></td>` +
        `<td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const html =
    `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">` +
    `<h2 style="margin:0 0 12px">${escapeHtml(kind)} — ${escapeHtml(pkg)}</h2>` +
    `<table style="border-collapse:collapse">${rows}</table>` +
    `<p><a href="${escapeHtml(waLink)}">Abrir chat en WhatsApp</a></p>` +
    `<h3 style="margin:16px 0 4px">Resumen</h3>` +
    `<p style="margin:0">${escapeHtml(lead.summary).replace(/\n/g, "<br>")}</p>` +
    `<p style="color:#777;font-size:12px">${escapeHtml(replyHint)}</p>` +
    `</div>`;

  return { subject, text, html };
}

/** LeadNotifier for LEAD_NOTIFIERS. Never throws. */
export async function sendLeadEmail(lead: Lead, isNew: boolean): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[lead-email] RESEND_API_KEY no configurada, se omite el correo");
    return;
  }

  const { subject, text, html } = buildLeadEmail(lead, isNew);
  const payload = {
    from: FROM,
    to: [CONTACT_EMAIL],
    subject,
    text,
    html,
    ...(lead.email ? { reply_to: lead.email } : {}),
  };

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("[lead-email] Resend respondió con error", res.status, await res.text());
    }
  } catch (err) {
    // Timeout (AbortSignal) or network failure. The error never carries request headers.
    console.error("[lead-email] no se pudo enviar el correo (timeout o red)", err);
  }
}
