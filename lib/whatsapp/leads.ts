// Lead capture behind the save_lead tool: validate → persist (Redis, 180-day TTL) → notify.
//
// Extension point: notifiers are pluggable. PR B (Resend) only appends its email
// notifier to LEAD_NOTIFIERS; the tool, the loop in claude.ts and the storage stay as is.
import { notifyOwner } from "./graph";
import { getLead, putLead } from "./store";
import { LEAD_INTERESTS, PACKAGES, type LeadInterest } from "./catalog";

export type Lead = {
  waId: string;
  name: string;
  email?: string;
  phone: string;
  interest: LeadInterest;
  summary: string;
  createdAt: string;
  updatedAt: string;
};

/** A channel that tells David about a new or updated lead. If one fails, the others still run. */
export type LeadNotifier = {
  name: string;
  notify: (lead: Lead, isNew: boolean) => Promise<void>;
};

// Only reaches David while the 24 h window with the bot number is open (Graph error
// 131047 otherwise; graph.ts logs it). That's why PR B adds email.
const whatsappOwnerNotifier: LeadNotifier = {
  name: "whatsapp-owner",
  notify: (lead, isNew) => notifyOwner(formatLeadMessage(lead, isNew)),
};

// PR B: append the Resend notifier here, e.g. `{ name: "email", notify: sendLeadEmail }`.
export const LEAD_NOTIFIERS: LeadNotifier[] = [whatsappOwnerNotifier];

/** What the save_lead tool reports back to Claude (`ok: false` → tool_result with is_error). */
export type ToolOutcome = { ok: boolean; message: string };

type LeadInput = Pick<Lead, "name" | "interest" | "summary"> & { email?: string; phone?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

function cleanText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

function isLeadInterest(value: unknown): value is LeadInterest {
  return typeof value === "string" && (LEAD_INTERESTS as readonly string[]).includes(value);
}

/**
 * Validates the tool input by hand. The API doesn't enforce the schema (no `strict`,
 * to stay compatible with the proxy), so the model's input is untrusted here.
 */
export function parseLeadInput(
  input: unknown,
): { ok: true; lead: LeadInput } | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Invalid input: expected an object." };
  }
  const raw = input as Record<string, unknown>;
  const name = cleanText(raw.name, 100);
  const summary = cleanText(raw.summary, 1000);
  const email = cleanText(raw.email, 254)?.toLowerCase();
  const phone = cleanText(raw.phone, 30);

  if (!name) return { ok: false, error: "Missing name: ask the user for their name first." };
  if (!summary) return { ok: false, error: "Missing summary: describe what the user needs." };
  if (!isLeadInterest(raw.interest)) {
    return { ok: false, error: `Invalid interest: use one of ${LEAD_INTERESTS.join(", ")}.` };
  }
  if (email && !EMAIL_RE.test(email)) {
    return {
      ok: false,
      error: "Invalid email: ask the user to double-check it, then call save_lead again.",
    };
  }
  return {
    ok: true,
    lead: {
      name,
      summary,
      interest: raw.interest,
      email,
      phone: phone && PHONE_RE.test(phone) ? phone : undefined,
    },
  };
}

/** Executes save_lead for a contact. Never throws. */
export async function handleSaveLead(waId: string, input: unknown): Promise<ToolOutcome> {
  const parsed = parseLeadInput(input);
  if (!parsed.ok) return { ok: false, message: parsed.error };

  const previous = await getLead(waId);
  const now = new Date().toISOString();
  const lead: Lead = {
    waId,
    name: parsed.lead.name,
    interest: parsed.lead.interest,
    summary: parsed.lead.summary,
    email: parsed.lead.email ?? previous?.email, // keep an email given earlier
    phone: parsed.lead.phone ?? previous?.phone ?? waId,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };

  if (!(await putLead(lead))) {
    // No PII in logs: the notifiers are now the only copy of this lead.
    console.error("[whatsapp] el lead NO quedó guardado en Redis; solo sale por los avisos", {
      waId,
      interest: lead.interest,
    });
  }

  // Notify on create, and on update only if something changed, so a model (or a user)
  // repeating save_lead can't flood David with identical alerts.
  if (!previous || fingerprint(previous) !== fingerprint(lead)) {
    await notifyAll(lead, !previous);
  }

  return {
    ok: true,
    message:
      "Lead saved. Thank the user and close: David will contact them by email or WhatsApp. Don't mention tools, saving, or databases.",
  };
}

function fingerprint(lead: Lead): string {
  return JSON.stringify([lead.name, lead.email, lead.phone, lead.interest, lead.summary]);
}

async function notifyAll(lead: Lead, isNew: boolean): Promise<void> {
  const results = await Promise.allSettled(LEAD_NOTIFIERS.map((n) => n.notify(lead, isNew)));
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[whatsapp] falló el aviso de lead "${LEAD_NOTIFIERS[i].name}"`, result.reason);
    }
  });
}

function formatLeadMessage(lead: Lead, isNew: boolean): string {
  const pkg = PACKAGES.find((p) => p.id === lead.interest);
  return [
    isNew ? "🔥 Nuevo lead" : "🔁 Lead actualizado",
    `Nombre: ${lead.name}`,
    `Interés: ${pkg ? pkg.name : "Custom (fuera del catálogo)"}`,
    `Email: ${lead.email ?? "(no lo dio)"}`,
    `Teléfono: ${lead.phone}`,
    `WhatsApp: ${lead.waId}`,
    "",
    lead.summary,
  ].join("\n");
}
