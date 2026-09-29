export function getCS_AuthCookieName(): string {
  return process.env.CS_AUTH_COOKIE ?? "cs_auth";
}

export function getCS_JwtSecret(): string {
  const secret = process.env.CS_JWT_SECRET;
  if (!secret) {
    throw new Error("Variable de entorno requerida: CS_JWT_SECRET");
  }
  return secret;
}

export function getCS_JwtExpiresIn(): string {
  return process.env.CS_JWT_EXPIRES_IN ?? "8h";
}

export function isCS_AuthConfigured(): boolean {
  return Boolean(process.env.CS_JWT_SECRET);
}
