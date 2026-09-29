import ExcelJS from "exceljs";
import JSZip from "jszip";
import { getCS_Esquema, getCS_SqlDatabase } from "@/lib/config/cs_env";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import { rowsFromRecordset } from "@/lib/excel/cs_excel_builder";
import type {
  CS_MonthReportParams,
  CS_ReportResult,
} from "@/types/CS_ReportJobParams";

/** frmReporteIR.cs btnGenerar_Click */
export async function runCS_IrReport(
  params: CS_MonthReportParams,
): Promise<CS_ReportResult> {
  const db = cs_bracketIdentifier(getCS_SqlDatabase());
  const esquema = cs_bracketIdentifier(getCS_Esquema());
  const sY = params.year;
  const sM = params.month;

  const companias = await cs_query<{ EMPRESA: string }>(
    `SELECT EMPRESA FROM ${db}.${esquema}.vwEMPLEADO_INFO_INSS GROUP BY EMPRESA`,
  );

  const zip = new JSZip();
  const generated: { name: string; buffer: Buffer }[] = [];

  for (const { EMPRESA: sCompania } of companias) {
    const rows = await cs_query<Record<string, unknown>>(
      `SELECT E.IDENTIFICACION, E.NOMBRE_COMPLETO NOMBRE, E1.DEVENGADO INGRESOS_BRUTOS,
              E1.DEDUCCION COTIZACION_INSS, '' PENSION_AHORRO, '' NUMERO_DOCUMENTO, '' FECHA_DOCUMENTO,
              E1.DEVENGADO - E1.DEDUCCION BASE_IMPONIBLE, E1.DEDUCCION_IR VALOR_RETENIDO,
              '' ALICUOTA_RETENCION, 11 CODIGO_RETENCION
       FROM ${db}.${esquema}.vwEMPLEADO_INFO_INSS E
       INNER JOIN ${db}.${esquema}.vwEMPLEADO_INFO_INSS_1 E1 ON E1.EMPLEADO = E.EMPLEADO
       WHERE E.EMPRESA = @empresa AND E1.AÑO = @anio AND E1.MES = @mes`,
      { empresa: sCompania, anio: sY, mes: sM },
    );

    if (rows.length === 0) continue;

    const { headers, rows: dataRows } = rowsFromRecordset(rows);
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Retención IR Laboral");
    ws.addRow(headers);
    dataRows.forEach((r) => ws.addRow(r));
    const buf = Buffer.from(await workbook.xlsx.writeBuffer());
    const name = `Reporte de IR - ${sCompania}.xlsx`;
    zip.file(name, buf);
    generated.push({ name, buffer: buf });
  }

  if (generated.length === 0) {
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet("Sin datos").addRow(["Sin registros"]);
    return {
      kind: "single",
      filename: "Reporte de IR - vacio.xlsx",
      buffer: Buffer.from(await wb.xlsx.writeBuffer()),
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  if (generated.length === 1) {
    return {
      kind: "single",
      filename: generated[0].name,
      buffer: generated[0].buffer,
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  return {
    kind: "zip",
    filename: `Reporte de IR ${sY}-${sM}.zip`,
    buffer: await zip.generateAsync({ type: "nodebuffer" }),
  };
}
