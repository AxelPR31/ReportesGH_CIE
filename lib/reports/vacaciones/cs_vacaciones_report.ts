import ExcelJS from "exceljs";
import { getCS_Esquema, getCS_SqlDatabase } from "@/lib/config/cs_env";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import type {
  CS_MonthReportParams,
  CS_ReportResult,
} from "@/types/CS_ReportJobParams";

function shiftMonth(year: number, month: number, delta: number) {
  let y = year;
  let m = month + delta;
  while (m < 1) {
    m += 12;
    y--;
  }
  while (m > 12) {
    m -= 12;
    y++;
  }
  return { year: y, month: m };
}

/** frmReporteVacGeneral.cs btnGenerar_Click */
export async function runCS_VacacionesReport(
  params: CS_MonthReportParams,
): Promise<CS_ReportResult> {
  const db = cs_bracketIdentifier(getCS_SqlDatabase());
  const esquema = cs_bracketIdentifier(getCS_Esquema());
  const nYear = params.year;
  const nMonth = params.month;
  const m1 = shiftMonth(nYear, nMonth, -1);
  const m2 = shiftMonth(nYear, nMonth, -2);
  const m3 = shiftMonth(nYear, nMonth, -3);

  const sSQLQry = `
    SELECT V1.EMPRESA, V1.[EMPLEADO] + ' - ' + V1.[NOMBRE] NOMBRE, V1.[CENTRO_COSTO], V1.[DESCRIPCION],
           V1.[FECHA_INGRESO], V1.[VACACIONES PENDIENTES] SALDO,
           ISNULL((SELECT DIAS FROM ${db}.${esquema}.[vwEMPLEADO_VAC_GOCE] V5 WHERE V5.EMPRESA=V1.EMPRESA AND V5.EMPLEADO = V1.EMPLEADO AND V5.AÑO = ${m3.year} AND V5.MES = ${m3.month}),0) [M-3],
           ISNULL((SELECT DIAS FROM ${db}.${esquema}.[vwEMPLEADO_VAC_GOCE] V4 WHERE V4.EMPRESA=V1.EMPRESA AND V4.EMPLEADO = V1.EMPLEADO AND V4.AÑO = ${m2.year} AND V4.MES = ${m2.month}),0) [M-2],
           ISNULL((SELECT DIAS FROM ${db}.${esquema}.[vwEMPLEADO_VAC_GOCE] V3 WHERE V3.EMPRESA=V1.EMPRESA AND V3.EMPLEADO = V1.EMPLEADO AND V3.AÑO = ${m1.year} AND V3.MES = ${m1.month}),0) [M-1],
           ISNULL((SELECT DIAS FROM ${db}.${esquema}.[vwEMPLEADO_VAC_GOCE] V2 WHERE V2.EMPRESA=V1.EMPRESA AND V2.EMPLEADO = V1.EMPLEADO AND V2.AÑO = ${nYear} AND V2.MES = ${nMonth}),0) M,
           V1.SALARIO_REFERENCIA * IIF(V1.MONEDA = 'C$',1,${db}.${esquema}.fUltimo_TC_mes(${nYear},${nMonth})) SALARIO,
           0 REMUNERACION
    FROM ${db}.${esquema}.[vwEMPLEADO_CALC_VAC] V1 ORDER BY 1,2`;

  const rows = await cs_query<Record<string, unknown>>(sSQLQry);

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("General de Vacaciones");

  if (rows.length === 0) {
    ws.addRow(["Sin datos"]);
  } else {
    const headers = Object.keys(rows[0]);
    headers.push("REMUNERACION");
    ws.addRow(headers);
    ws.getCell(1, 7).value = `${m3.year}-${m3.month}`;
    ws.getCell(1, 8).value = `${m2.year}-${m2.month}`;
    ws.getCell(1, 9).value = `${m1.year}-${m1.month}`;
    ws.getCell(1, 10).value = `${nYear}-${nMonth}`;

    rows.forEach((row, i) => {
      const salario = Number(row.SALARIO ?? 0);
      const saldo = Number(row.SALDO ?? 0);
      const remuneracion = (salario / 30) * saldo;
      const values = headers.slice(0, -1).map((h) => row[h] ?? null);
      values.push(Math.round(remuneracion * 100) / 100);
      ws.addRow(values);
    });
  }

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  return {
    kind: "single",
    filename: "General de Vacaciones - CIE.xlsx",
    buffer,
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
