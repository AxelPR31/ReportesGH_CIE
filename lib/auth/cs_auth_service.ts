import { getCS_Esquema, getCS_SqlDatabase, isCS_SqlConfigured } from "@/lib/config/cs_env";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import { cs_verifySoftlandPassword } from "@/lib/auth/cs_softland_password";
import type { CS_UserPrincipal } from "@/types/CS_UserPrincipal";

type CS_UsuarioRow = Record<string, unknown>;

function pickString(row: CS_UsuarioRow, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (typeof v === "string") return v;
  }
  throw new Error("Columna no encontrada en USUARIO");
}

function pickOptionalString(row: CS_UsuarioRow, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (typeof v === "string") return v;
  }
  return "";
}

async function findSoftlandUser(usuario: string): Promise<CS_UsuarioRow | null> {
  if (!isCS_SqlConfigured()) {
    throw new Error("SQL no configurado");
  }
  const db = cs_bracketIdentifier(getCS_SqlDatabase());
  const esquema = cs_bracketIdentifier(getCS_Esquema());
  const rows = await cs_query<CS_UsuarioRow>(
    `SELECT [USUARIO], [CLAVE], [NOMBRE] FROM ${db}.${esquema}.[USUARIO] WHERE [USUARIO] = @usuario`,
    { usuario },
  );
  return rows[0] ?? null;
}

function buildPrincipal(row: CS_UsuarioRow): CS_UserPrincipal {
  return {
    usuario: pickString(row, "USUARIO", "usuario"),
    idUser: 0,
    nombre:
      pickOptionalString(row, "NOMBRE", "nombre") ||
      pickString(row, "USUARIO", "usuario"),
    tipoUsuario: "SOFTLAND",
    idCliente: "",
    caja: "",
    canViewOtherCashiers: false,
    isAdmin: false,
    consecutivo: undefined,
  };
}

export async function cs_signInSoftland(
  usuario: string,
  contrasena: string,
): Promise<CS_UserPrincipal> {
  const row = await findSoftlandUser(usuario);
  if (!row) {
    throw new CS_AuthError("Credenciales invalidas", 400);
  }

  const clave = pickString(row, "CLAVE", "clave");
  let valid = false;
  try {
    valid = cs_verifySoftlandPassword(contrasena, clave);
  } catch {
    throw new CS_AuthError("No se pudo validar la contraseña", 500);
  }

  if (!valid) {
    throw new CS_AuthError("Credenciales invalidas", 400);
  }

  return buildPrincipal(row);
}

export async function cs_refreshSoftlandUser(
  usuario: string,
): Promise<CS_UserPrincipal> {
  const row = await findSoftlandUser(usuario);
  if (!row) {
    throw new CS_AuthError("Usuario no encontrado", 404);
  }
  return buildPrincipal(row);
}

export class CS_AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
