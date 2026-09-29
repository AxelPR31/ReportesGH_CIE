import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCS_AuthCookieName } from "@/lib/auth/cs_auth_config";
import {
  cs_parseBearerCookie,
  cs_verifyAccessToken,
} from "@/lib/auth/cs_auth_session";

const PUBLIC_PATHS = new Set([
  "/login",
  "/api/health",
  "/api/auth",
  "/icon",
  "/apple-icon",
  "/favicon.ico",
]);

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (/\.(jpg|jpeg|png|gif|svg|ico|webp)$/i.test(pathname)) return true;
  return PUBLIC_PATHS.has(pathname);
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const raw = request.cookies.get(getCS_AuthCookieName())?.value;
  const token = cs_parseBearerCookie(raw);
  if (!token) return false;
  try {
    await cs_verifyAccessToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (pathname === "/login" && (await hasValidSession(request))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const ok = await hasValidSession(request);
  if (ok) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
