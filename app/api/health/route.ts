import { NextResponse } from "next/server";
import { isCS_SqlConfigured } from "@/lib/config/cs_env";
import { getCS_SqlPool } from "@/lib/db/cs_sql_pool";

export async function GET() {
  if (!isCS_SqlConfigured()) {
    return NextResponse.json({
      ok: false,
      sql: "not_configured",
      message: "Defina CS_SQL_SERVER, CS_SQL_USER y CS_SQL_PASSWORD",
    });
  }
  try {
    const pool = await getCS_SqlPool();
    await pool.request().query("SELECT 1 AS ok");
    return NextResponse.json({ ok: true, sql: "connected" });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      sql: "error",
      message: error instanceof Error ? error.message : "Error de conexión",
    });
  }
}
