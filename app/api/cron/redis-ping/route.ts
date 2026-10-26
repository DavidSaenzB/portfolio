// Ping diario a Redis (Vercel Cron, ver vercel.json).
// Upstash archives free databases after a period of inactivity; that's what took the
// webhook down with ENOTFOUND. One write a day keeps the database active.
// Vercel calls this with `Authorization: Bearer <CRON_SECRET>`.
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { pingRedis } from "@/lib/whatsapp/store";

export const runtime = "nodejs"; // timingSafeEqual usa node:crypto
export const dynamic = "force-dynamic";

/** Fail-closed: without CRON_SECRET configured, every call is rejected. */
function authorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(req: NextRequest) {
  if (!authorized(req.headers.get("authorization"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const at = await pingRedis();
    return NextResponse.json({ ok: true, at });
  } catch (err) {
    // 503 so the run shows as failed in Vercel → Cron Jobs.
    console.error("[cron] el ping a Redis falló", err);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
