import { getCS_Esquema, getCS_SqlDatabase } from "@/lib/config/cs_env";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import {
  buildCS_WorkbookBuffer,
  rowsFromRecordset,
} from "@/lib/excel/cs_excel_builder";
import type { CS_ReportResult } from "@/types/CS_ReportJobParams";

/** ReportesGH.cs colaboradoresPorSexoToolStripMenuItem_Click */
export async function runCS_SexoReport(): Promise<CS_ReportResult> {
  const db = cs_bracketIdentifier(getCS_SqlDatabase());
  const esquema = cs_bracketIdentifier(getCS_Esquema());
  const base = `${db}.${esquema}`;

  const tblFem = await cs_query<Record<string, unknown>>(
    `SELECT EMPRESA, EMPLEADO, NOMBRE, SEXO, FECHA_NACIMIENTO, FECHA_INGRESO
     FROM ${base}.vwEMPLEADO_ANIVERSARIO WHERE SEXO = 'F' ORDER BY EMPRESA, EMPLEADO`,
  );
  const tblMas = await cs_query<Record<string, unknown>>(
    `SELECT EMPRESA, EMPLEADO, NOMBRE, SEXO, FECHA_NACIMIENTO, FECHA_INGRESO
     FROM ${base}.vwEMPLEADO_ANIVERSARIO WHERE SEXO = 'M' ORDER BY EMPRESA, EMPLEADO`,
  );

  const sheets = [];
  if (tblFem.length > 0) {
    const { headers, rows } = rowsFromRecordset(tblFem);
    sheets.push({
      name: "Mujeres",
      headers,
      rows,
      headerArgb: "FFC71585",
    });
  }
  if (tblMas.length > 0) {
    const { headers, rows } = rowsFromRecordset(tblMas);
    sheets.push({
      name: "Varones",
      headers,
      rows,
      headerArgb: "FF1E3A8A",
    });
  }
  if (sheets.length === 0) {
    sheets.push({
      name: "Sin datos",
      headers: ["Mensaje"],
      rows: [["No hay registros"]],
    });
  }

  const buffer = await buildCS_WorkbookBuffer(sheets);
  return {
    kind: "single",
    filename: "Colaboradores por Sexo - CIE.xlsx",
    buffer,
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
