import ExcelJS from "exceljs";
import { getCS_Esquema, getCS_SqlDatabase } from "@/lib/config/cs_env";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import {
  cs_calcularAMD,
  cs_calcularIndemnizacion,
} from "@/lib/reports/indemnizacion/cs_indemnizacion";
import type {
  CS_DateReportParams,
  CS_ReportResult,
} from "@/types/CS_ReportJobParams";

/** frmReporteIndemGeneral.cs btnGenerar_Click */
export async function runCS_IndemnizacionReport(
  params: CS_DateReportParams,
): Promise<CS_ReportResult> {
  const cutDate = new Date(params.cutDate);
  const nMonth = cutDate.getMonth() + 1;
  const nYear = cutDate.getFullYear();
  const dAguinaldo =
    nMonth !== 12
      ? new Date(nYear - 1, 11, 1)
      : new Date(nYear, 11, 1);

  const db = cs_bracketIdentifier(getCS_SqlDatabase());
  const esquema = cs_bracketIdentifier(getCS_Esquema());

  const sSQLQry = `
    SELECT V1.EMPRESA, V1.[EMPLEADO] + ' - ' + V1.[NOMBRE] NOMBRE, V1.[CENTRO_COSTO], V1.[DESCRIPCION],
           V1.[FECHA_INGRESO], '' FECHA_CORTE,
           V1.SALARIO_REFERENCIA * IIF(V1.MONEDA = 'C$',1,${db}.${esquema}.fUltimo_TC_mes(${nYear},${nMonth})) SALARIO,
           0 AÑOS, 0 MESES, 0 DIAS, 0 INDEMNIZACION,
           V1.[VACACIONES PENDIENTES] [DIAS VACACIONES], 0 AS [PAGO VACACIONES], 0 AS [DIAS AGUINALDO],
           0 AS [PAGO AUINALDO], 0 [TOTAL PRESTACIONES]
    FROM ${db}.${esquema}.[vwEMPLEADO_CALC_VAC] V1 ORDER BY 1,5,2`;

  let rows = await cs_query<Record<string, unknown>>(sSQLQry);

  const filtro = params.empleadoFiltro?.trim();
  if (filtro) {
    const term = filtro.toLowerCase();
    rows = rows.filter((row) => {
      const nombre = String(row.NOMBRE ?? "").toLowerCase();
      const codigo = nombre.split(" - ")[0]?.trim() ?? "";
      return (
        nombre.includes(term) ||
        codigo === filtro.trim() ||
        codigo.startsWith(filtro.trim())
      );
    });
  }

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("General de Indemnizacion");

  const headers = [
    "EMPRESA",
    "NOMBRE",
    "CENTRO_COSTO",
    "DESCRIPCION",
    "FECHA_INGRESO",
    "FECHA_CORTE",
    "SALARIO",
    "AÑOS",
    "MESES",
    "DIAS",
    "INDEMNIZACION",
    "DIAS VACACIONES",
    "PAGO VACACIONES",
    "DIAS AGUINALDO",
    "PAGO AUINALDO",
    "TOTAL PRESTACIONES",
  ];
  ws.addRow(headers);

  let totalIndem = 0;
  let totalVac = 0;
  let totalAgui = 0;
  let totalPrest = 0;

  for (const row of rows) {
    const fechaIngreso = new Date(row.FECHA_INGRESO as string | Date);
    const salario = Number(row.SALARIO ?? 0);
    const diasVac = Number(row["DIAS VACACIONES"] ?? 0);
    const dAguinaldoT = fechaIngreso >= dAguinaldo ? fechaIngreso : dAguinaldo;

    const amd = cs_calcularAMD(fechaIngreso, cutDate);
    const amdAgui = cs_calcularAMD(dAguinaldoT, cutDate);
    const indemnizacion = cs_calcularIndemnizacion(
      salario,
      amd.years,
      amd.months,
      amd.days,
    );
    let diasAgui = amdAgui.months * 2.5 + (amdAgui.days / 30) * 2.5;
    const vacaciones = Math.round((salario / 30) * diasVac * 100) / 100;
    const aguinaldo = Math.round((salario / 30) * diasAgui * 100) / 100;
    const total = vacaciones + aguinaldo + indemnizacion;

    totalIndem += indemnizacion;
    totalVac += vacaciones;
    totalAgui += aguinaldo;
    totalPrest += total;

    ws.addRow([
      row.EMPRESA,
      row.NOMBRE,
      row.CENTRO_COSTO,
      row.DESCRIPCION,
      fechaIngreso,
      cutDate,
      salario,
      amd.years,
      amd.months,
      amd.days,
      indemnizacion,
      diasVac,
      vacaciones,
      diasAgui,
      aguinaldo,
      total,
    ]);
  }

  const last = ws.rowCount + 2;
  ws.getCell(last, 11).value = totalIndem;
  ws.getCell(last, 13).value = totalVac;
  ws.getCell(last, 15).value = totalAgui;
  ws.getCell(last, 16).value = totalPrest;

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  return {
    kind: "single",
    filename: "General de Indemnizacion - CIE.xlsx",
    buffer,
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
