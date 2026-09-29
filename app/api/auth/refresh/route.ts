import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CS_AuthError, cs_refreshSoftlandUser } from "@/lib/auth/cs_auth_service";
import {
  cs_authCookieOptions,
  cs_parseBearerCookie,
  cs_signAccessToken,
  cs_verifyAccessToken,
} from "@/lib/auth/cs_auth_session";

async function getUserIdFromCookie(): Promise<string | null> {
  const opts = cs_authCookieOptions();
  const jar = await cookies();
  const token = cs_parseBearerCookie(jar.get(opts.name)?.value);
  if (!token) return null;
  try {
    return await cs_verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function POST() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const user = await cs_refreshSoftlandUser(userId);
    const token = await cs_signAccessToken(user.usuario);
    const opts = cs_authCookieOptions();
    const jar = await cookies();
    jar.set(opts.name, `Bearer ${token}`, {
      httpOnly: opts.httpOnly,
      sameSite: opts.sameSite,
      secure: opts.secure,
      path: opts.path,
    });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof CS_AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Error al renovar sesión" }, { status: 500 });
  }
}
