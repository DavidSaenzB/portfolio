// Verificación de la firma HMAC de los webhooks de Meta (X-Hub-Signature-256).
// Se valida contra el body CRUDO: un JSON re-serializado nunca cuadraría con la firma.
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Devuelve true solo si la firma es válida.
 * Fail-closed: sin WHATSAPP_APP_SECRET configurado devuelve SIEMPRE false
 * (nunca aceptamos un POST sin poder verificarlo).
 */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return false; // fail-closed
  if (!header?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const given = header.slice("sha256=".length);

  // timingSafeEqual exige buffers de igual longitud; la guarda evita que lance.
  if (given.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false; // hex malformado u otro fallo → no válido
  }
}
