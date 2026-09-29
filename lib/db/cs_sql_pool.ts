import sql from "mssql";
import {
  getCS_SqlDatabase,
  getCS_SqlPassword,
  getCS_SqlServer,
  getCS_SqlUser,
} from "@/lib/config/cs_env";

let pool: sql.ConnectionPool | null = null;

export async function getCS_SqlPool(): Promise<sql.ConnectionPool> {
  if (pool?.connected) {
    return pool;
  }

  pool = await sql.connect({
    server: getCS_SqlServer(),
    database: getCS_SqlDatabase(),
    user: getCS_SqlUser(),
    password: getCS_SqlPassword(),
    options: {
      encrypt: process.env.CS_SQL_ENCRYPT === "true",
      trustServerCertificate: process.env.CS_SQL_TRUST_CERT !== "false",
    },
    requestTimeout: 300_000,
    connectionTimeout: 30_000,
  });

  return pool;
}

export async function cs_query<T extends Record<string, unknown>>(
  queryText: string,
  inputs?: Record<string, string | number | Date | null>,
): Promise<T[]> {
  const connection = await getCS_SqlPool();
  const request = connection.request();
  if (inputs) {
    for (const [key, value] of Object.entries(inputs)) {
      request.input(key, value);
    }
  }
  const result = await request.query<T>(queryText);
  return result.recordset ?? [];
}

export function cs_bracketIdentifier(name: string): string {
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error(`Identificador SQL no válido: ${name}`);
  }
  return `[${name}]`;
}
