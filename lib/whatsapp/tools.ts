// Tools del bot.
// - save_lead: ACTIVE (Fase 4a). Definition here, logic in ./leads.ts, loop in ./claude.ts.
// - get_available_slots / book_appointment: CONSERVADAS PERO DESACTIVADAS until Fase 4b
//   (Google Calendar). Nothing on the active path imports `buildSchedulingTools`; it stays
//   compiling so scheduling can be rebuilt on top of it.
import type Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { redis } from "./store";
import { notifyOwner } from "./graph";
import { LEAD_INTERESTS, PACKAGES } from "./catalog";

// ---------- save_lead (activa) ----------

export const SAVE_LEAD_TOOL: Anthropic.Tool = {
  name: "save_lead",
  description:
    "Save a prospective client so David can follow up by email or WhatsApp. Call it once you know the person's name, what they need, and which package fits (or 'custom'). Ask for their email first; it's optional. Call it again only if key details change. Never mention this tool to the user.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "The person's name, as they gave it." },
      email: {
        type: "string",
        description: "Their email, only if they shared it. Omit it otherwise; never invent one.",
      },
      phone: {
        type: "string",
        description:
          "Only if they gave a phone number different from this WhatsApp. Omit it otherwise.",
      },
      interest: {
        type: "string",
        enum: [...LEAD_INTERESTS],
        description: `Package of interest: ${PACKAGES.map((p) => `${p.id} = ${p.name}`).join("; ")}; custom = anything outside those packages.`,
      },
      summary: {
        type: "string",
        description:
          "1–3 sentences in the conversation's language: what they need, their business or project, and any timeline or constraints they mentioned.",
      },
    },
    required: ["name", "interest", "summary"],
  },
};

// ---------- Agendamiento (desactivado hasta la Fase 4b) ----------

const TIMEZONE = "America/Bogota";
const BUSINESS_HOURS = [9, 10, 11, 14, 15, 16]; // franjas de 1 h, hora local

type Appointment = {
  name: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  topic: string;
  createdAt: string;
};

async function getAppointments(date: string): Promise<Appointment[]> {
  if (!redis) return [];
  return (await redis.get<Appointment[]>(`wa:appts:${date}`)) ?? [];
}

async function addAppointment(appt: Appointment): Promise<void> {
  if (!redis) return;
  const existing = await getAppointments(appt.date);
  await redis.set(`wa:appts:${appt.date}`, [...existing, appt]);
}

function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

function isWeekend(date: string): boolean {
  const day = new Date(`${date}T12:00:00-05:00`).getUTCDay();
  return day === 0 || day === 6;
}

/** Construye las 2 tools de agendamiento para un contacto. Actualmente sin uso. */
export function buildSchedulingTools(userPhone: string) {
  const getAvailableSlots = betaTool({
    name: "get_available_slots",
    description:
      "Consulta las franjas horarias libres para una cita en una fecha dada (hora de Colombia). Úsala antes de proponer u ofrecer horarios.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "Fecha en formato YYYY-MM-DD" },
      },
      required: ["date"],
    },
    run: async (input) => {
      const { date } = input as { date: string };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return "Error: la fecha debe tener formato YYYY-MM-DD.";
      }
      if (date < todayInBogota()) {
        return `Error: ${date} ya pasó. Hoy es ${todayInBogota()}.`;
      }
      if (isWeekend(date)) {
        return `El ${date} cae en fin de semana. David atiende de lunes a viernes.`;
      }
      const booked = new Set((await getAppointments(date)).map((a) => a.time));
      const free = BUSINESS_HOURS.map((h) => `${String(h).padStart(2, "0")}:00`).filter(
        (t) => !booked.has(t),
      );
      return free.length
        ? `Franjas libres el ${date} (hora Colombia): ${free.join(", ")}`
        : `No quedan franjas libres el ${date}.`;
    },
  });

  const bookAppointment = betaTool({
    name: "book_appointment",
    description:
      "Agenda una cita/llamada con David. Llamar solo después de confirmar fecha, hora, nombre y email con el usuario, y de verificar disponibilidad con get_available_slots.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre completo del cliente" },
        email: { type: "string", description: "Email del cliente" },
        date: { type: "string", description: "Fecha YYYY-MM-DD" },
        time: { type: "string", description: "Hora HH:mm (hora Colombia)" },
        topic: { type: "string", description: "Tema o motivo de la llamada" },
      },
      required: ["name", "email", "date", "time", "topic"],
    },
    run: async (input) => {
      const appt = input as {
        name: string;
        email: string;
        date: string;
        time: string;
        topic: string;
      };
      const booked = (await getAppointments(appt.date)).map((a) => a.time);
      if (booked.includes(appt.time)) {
        return `Error: la franja ${appt.time} del ${appt.date} ya está ocupada. Ofrece otra.`;
      }
      await addAppointment({ ...appt, phone: userPhone, createdAt: new Date().toISOString() });
      await notifyOwner(
        `📅 Nueva cita: ${appt.name} — ${appt.date} ${appt.time}\nTema: ${appt.topic}\nEmail: ${appt.email}\nWhatsApp: ${userPhone}`,
      );
      return `Cita confirmada: ${appt.date} a las ${appt.time} (hora Colombia) con ${appt.name}.`;
    },
  });

  return [getAvailableSlots, bookAppointment];
}
