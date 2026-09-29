import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cs_authCookieOptions } from "@/lib/auth/cs_auth_session";

export async function POST() {
  const opts = cs_authCookieOptions();
  const jar = await cookies();
  jar.delete(opts.name);
  return NextResponse.json({ ok: true });
}
