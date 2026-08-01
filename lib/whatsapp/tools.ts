// Tools de agendamiento del bot — CONSERVADAS PERO DESACTIVADAS en la v1.
//
// Nada del camino activo importa este archivo: el bot v1 arranca magro (ver
// claude.ts). Se mantiene, listo y compilando, para reactivar el agendamiento
// sin reconstruir nada. Para reactivar: importar `buildTools` en claude.ts y
// pasar el array a `client.beta.messages.toolRunner({ ..., tools })` en vez de
// usar `messages.create`. Ver el comentario en claude.ts.
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { redis } from "./store";
import { notifyOwner } from "./graph";

const TIMEZONE = "America/Bogota";
const BUSINESS_HOURS = [9, 10, 11, 14, 15, 16]; // franjas de 1 h, hora local

// ---------- Persistencia de citas y leads (solo la usan las tools) ----------

type Appointment = {
  name: string;
  email: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  topic: string;
  createdAt: string;
};

type Lead = {
  name: string;
  contact: string;
  interest: string;
  details: string;
  phone: string;
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

async function addLead(lead: Lead): Promise<void> {
  if (!redis) return;
  const existing = (await redis.get<Lead[]>("wa:leads")) ?? [];
  await redis.set("wa:leads", [...existing, lead]);
}

// ---------- Helpers de fecha ----------

function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

function isWeekend(date: string): boolean {
  const day = new Date(`${date}T12:00:00-05:00`).getUTCDay();
  return day === 0 || day === 6;
}

// ---------- Definición de las tools ----------

/** Construye las 3 tools de agendamiento para un contacto. Actualmente sin uso. */
export function buildTools(userPhone: string) {
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

  const saveLead = betaTool({
    name: "save_lead",
    description:
      "Guarda un cliente potencial interesado en contratar un servicio. Llamar cuando el usuario exprese interés de compra/contratación y ya tengas al menos su nombre y qué necesita.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre del interesado" },
        contact: {
          type: "string",
          description: "Email u otro medio de contacto (si no da otro, su WhatsApp)",
        },
        interest: { type: "string", description: "Servicio de interés (web, IA, datos, otro)" },
        details: {
          type: "string",
          description: "Resumen de la necesidad, presupuesto o plazos mencionados",
        },
      },
      required: ["name", "contact", "interest", "details"],
    },
    run: async (input) => {
      const lead = input as {
        name: string;
        contact: string;
        interest: string;
        details: string;
      };
      await addLead({ ...lead, phone: userPhone, createdAt: new Date().toISOString() });
      await notifyOwner(
        `🔥 Nuevo lead: ${lead.name} (${lead.contact})\nInterés: ${lead.interest}\n${lead.details}\nWhatsApp: ${userPhone}`,
      );
      return "Lead guardado. David lo contactará pronto.";
    },
  });

  return [getAvailableSlots, bookAppointment, saveLead];
}
