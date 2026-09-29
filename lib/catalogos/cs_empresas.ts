import {
  getCS_SqlDatabase,
  getCS_SqlDatabase2,
} from "@/lib/config/cs_env";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import type { CS_Empresa } from "@/types/CS_Empresa";

export async function listCS_Empresas(): Promise<CS_Empresa[]> {
  const db1 = cs_bracketIdentifier(getCS_SqlDatabase());
  const db2 = cs_bracketIdentifier(getCS_SqlDatabase2());
  const rows = await cs_query<{ CONJUNTO: string }>(
    `SELECT CONJUNTO FROM ${db1}.ERPADMIN.CONJUNTO
     UNION ALL
     SELECT CONJUNTO FROM ${db2}.ERPADMIN.CONJUNTO`,
  );
  const unique = [...new Set(rows.map((r) => r.CONJUNTO).filter(Boolean))];
  return unique.sort().map((conjunto) => ({ conjunto }));
}

export async function assertCS_EmpresaAllowed(empresa: string): Promise<void> {
  const allowed = await listCS_Empresas();
  if (!allowed.some((e) => e.conjunto === empresa)) {
    throw new Error(`Empresa no permitida: ${empresa}`);
  }
}

export function resolveCS_DataDatabase(empresa: string): string {
  if (empresa === "ZAFINSA" || empresa === "CONGREXP") {
    return getCS_SqlDatabase2();
  }
  return getCS_SqlDatabase();
}
