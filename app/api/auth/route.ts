import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { isCS_AuthConfigured } from "@/lib/auth/cs_auth_config";
import {
  CS_AuthError,
  cs_refreshSoftlandUser,
  cs_signInSoftland,
} from "@/lib/auth/cs_auth_service";
import {
  cs_authCookieOptions,
  cs_parseBearerCookie,
  cs_signAccessToken,
  cs_verifyAccessToken,
} from "@/lib/auth/cs_auth_session";

const signInSchema = z.object({
  usuario: z.string().min(1),
  contrasena: z.string().min(1),
});

async function setAuthCookie(token: string) {
  const opts = cs_authCookieOptions();
  const jar = await cookies();
  jar.set(opts.name, `Bearer ${token}`, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
  });
}

async function clearAuthCookie() {
  const opts = cs_authCookieOptions();
  const jar = await cookies();
  jar.delete(opts.name);
}

async function getUserIdFromCookie(): Promise<string | null> {
  const opts = cs_authCookieOptions();
  const jar = await cookies();
  const raw = jar.get(opts.name)?.value;
  const token = cs_parseBearerCookie(raw);
  if (!token) return null;
  try {
    return await cs_verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!isCS_AuthConfigured()) {
    return NextResponse.json(
      { error: "Autenticación no configurada (CS_JWT_SECRET)" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const user = await cs_signInSoftland(
      parsed.data.usuario.trim(),
      parsed.data.contrasena,
    );
    const token = await cs_signAccessToken(user.usuario);
    await setAuthCookie(token);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof CS_AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al iniciar sesión" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const user = await cs_refreshSoftlandUser(userId);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof CS_AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Error al obtener sesión" }, { status: 500 });
  }
}
