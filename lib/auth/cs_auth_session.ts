import { SignJWT, jwtVerify } from "jose";
import {
  getCS_AuthCookieName,
  getCS_AuthCookieSecure,
  getCS_JwtExpiresIn,
  getCS_JwtSecret,
} from "@/lib/auth/cs_auth_config";

function secretKey() {
  return new TextEncoder().encode(getCS_JwtSecret());
}

export async function cs_signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(getCS_JwtExpiresIn())
    .sign(secretKey());
}

export async function cs_verifyAccessToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, secretKey());
  const id = payload.id;
  if (typeof id !== "string" || !id) {
    throw new Error("Token inválido");
  }
  return id;
}

export function cs_parseBearerCookie(raw: string | undefined): string | null {
  if (!raw) return null;
  return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
}

export function cs_authCookieOptions() {
  return {
    name: getCS_AuthCookieName(),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: getCS_AuthCookieSecure(),
    path: "/",
  };
}
