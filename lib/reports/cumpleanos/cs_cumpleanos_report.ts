import { getCS_Esquema, getCS_SqlDatabase } from "@/lib/config/cs_env";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import {
  buildCS_WorkbookBuffer,
  rowsFromRecordset,
} from "@/lib/excel/cs_excel_builder";
import type {
  CS_MonthReportParams,
  CS_ReportResult,
} from "@/types/CS_ReportJobParams";

/** frmReporteCumple.cs btnGenerar_Click */
export async function runCS_CumpleanosReport(
  params: CS_MonthReportParams,
): Promise<CS_ReportResult> {
  const db = cs_bracketIdentifier(getCS_SqlDatabase());
  const esquema = cs_bracketIdentifier(getCS_Esquema());
  const base = `${db}.${esquema}`;
  const sM = params.month;

  const tblCumple = await cs_query<Record<string, unknown>>(
    `SELECT EMPRESA, EMPLEADO, NOMBRE, SEXO, FECHA_NACIMIENTO,
            YEAR(GETDATE()) - YEAR(FECHA_NACIMIENTO) EDAD
     FROM ${base}.vwEMPLEADO_ANIVERSARIO
     WHERE MES_NACIMIENTO = @mes ORDER BY EMPRESA, EMPLEADO`,
    { mes: sM },
  );

  const tblAniversario = await cs_query<Record<string, unknown>>(
    `SELECT UPPER(EMPRESA) EMPRESA, EMPLEADO, NOMBRE, SEXO, FECHA_INGRESO,
            YEAR(GETDATE()) - YEAR(FECHA_INGRESO) AS ANTIGUEDAD
     FROM ${base}.vwEMPLEADO_ANIVERSARIO
     WHERE MES_INGRESO = @mes ORDER BY EMPRESA, EMPLEADO`,
    { mes: sM },
  );

  const sheets = [];
  if (tblCumple.length > 0) {
    const { headers, rows } = rowsFromRecordset(tblCumple);
    sheets.push({
      name: "Cumpleañeros",
      headers,
      rows,
      headerArgb: "FFFF8C00",
    });
  }
  if (tblAniversario.length > 0) {
    const { headers, rows } = rowsFromRecordset(tblAniversario);
    sheets.push({
      name: "Aniversarios",
      headers,
      rows,
      headerArgb: "FF006400",
    });
  }
  if (sheets.length === 0) {
    sheets.push({
      name: "Sin datos",
      headers: ["Mensaje"],
      rows: [["No hay registros para el mes seleccionado"]],
    });
  }

  const buffer = await buildCS_WorkbookBuffer(sheets);
  return {
    kind: "single",
    filename: "Cumpleaños y Aniversarios - CIE.xlsx",
    buffer,
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
