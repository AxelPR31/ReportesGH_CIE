function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable de entorno requerida: ${name}`);
  }
  return value;
}

export function getCS_SqlServer(): string {
  return requireEnv("CS_SQL_SERVER");
}

export function getCS_SqlDatabase(): string {
  return process.env.CS_SQL_DATABASE ?? "CIE_BD";
}

export function getCS_SqlDatabase2(): string {
  return process.env.CS_SQL_DATABASE2 ?? getCS_SqlDatabase();
}

export function getCS_SqlUser(): string {
  return requireEnv("CS_SQL_USER");
}

export function getCS_SqlPassword(): string {
  return requireEnv("CS_SQL_PASSWORD");
}

export function getCS_Esquema(): string {
  return process.env.CS_SQL_ESQUEMA ?? "ERPADMIN";
}

export function isCS_SqlConfigured(): boolean {
  return Boolean(
    process.env.CS_SQL_SERVER &&
      process.env.CS_SQL_USER &&
      process.env.CS_SQL_PASSWORD,
  );
}
