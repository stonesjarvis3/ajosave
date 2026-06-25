import { NextResponse } from "next/server";
import { purgeExpiredPii } from "@/lib/retention";

export async function POST() {
  const purged = await purgeExpiredPii();
  return NextResponse.json({ ok: true, purged });
}
