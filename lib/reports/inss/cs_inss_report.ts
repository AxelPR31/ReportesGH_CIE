import ExcelJS from "exceljs";
import JSZip from "jszip";
import { getCS_Esquema, getCS_SqlDatabase } from "@/lib/config/cs_env";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import {
  cs_buildInssCsvRow,
  cs_fPrimerDiaMes,
  cs_fUltimoDiaMes,
  cs_iContarSemanas,
  cs_sSemanasINSS,
  cs_sSemanasINSS_Nuevos,
} from "@/lib/reports/inss/cs_inss_semanas";
import { rowsFromRecordset } from "@/lib/excel/cs_excel_builder";
import type {
  CS_MonthReportParams,
  CS_ReportResult,
} from "@/types/CS_ReportJobParams";

async function addSheetFromQuery(
  workbook: ExcelJS.Workbook,
  name: string,
  recordset: Record<string, unknown>[],
  semanasCol?: (rowIndex: number) => string,
  csvColumn?: boolean,
): Promise<void> {
  if (recordset.length === 0) return;
  const { headers, rows } = rowsFromRecordset(recordset);
  const allHeaders = csvColumn ? [...headers, "CSV"] : headers;
  const ws = workbook.addWorksheet(name);
  ws.addRow(allHeaders);
  rows.forEach((row, idx) => {
    const data = [...row];
    if (semanasCol) {
      const semIdx = 9;
      if (data.length > semIdx) data[semIdx] = semanasCol(idx);
    }
    if (csvColumn) {
      data.push(cs_buildInssCsvRow(data.slice(0, 12)));
    }
    ws.addRow(data);
  });
}

/** frmReporteINSS.cs btnGenerar_Click */
export async function runCS_InssReport(
  params: CS_MonthReportParams,
): Promise<CS_ReportResult> {
  const db = getCS_SqlDatabase();
  const esquema = getCS_Esquema();
  const dbQ = cs_bracketIdentifier(db);
  const esqQ = cs_bracketIdentifier(esquema);
  const sY = params.year;
  const sM = params.month;

  const companias = await cs_query<{ EMPRESA: string }>(
    `SELECT EMPRESA FROM ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS GROUP BY EMPRESA`,
  );

  const semanasMes = cs_sSemanasINSS(
    cs_iContarSemanas(
      cs_fPrimerDiaMes(sY, sM),
      cs_fUltimoDiaMes(sY, sM),
    ),
  );

  const zip = new JSZip();
  let files = 0;

  for (const { EMPRESA: sCompania } of companias) {
    const workbook = new ExcelJS.Workbook();

    const activos = await cs_query<Record<string, unknown>>(
      `SELECT E.ASEGURADO, E.NOMBRE, E.APELLIDO, E.NOMINA, E.NOVEDAD,
              ${dbQ}.${esqQ}.fecha_formato_inss(${dbQ}.${esqQ}.fPrimer_dia_mes(E1.AÑO,E1.MES)) FECHA_NOVEDAD,
              E1.DEVENGADO,
              E.SALARIO_MENSUAL * IIF(E.MONEDA_SALARIO = 'C$',1,(SELECT TC.MONTO FROM ${dbQ}.CIE.TIPO_CAMBIO_HIST TC WHERE TC.FECHA = ${dbQ}.${esqQ}.fUltimo_dia_mes(E1.AÑO,E1.MES))) SALARIO_MENSUAL,
              0 APORTE, '11110' SEMANAS, '0' CENTRO_COSTO, '' TIPO_EMPLEO,
              E1.DEDUCCION, E1.PATRONAL, E1.INATEC
       FROM ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS E
       INNER JOIN ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS_1 E1 ON E1.EMPLEADO = E.EMPLEADO
       WHERE E.EMPRESA = @empresa AND E1.AÑO = @anio AND E1.MES = @mes
         AND E.FECHA_INGRESO < ${dbQ}.${esqQ}.fPrimer_dia_mes(E1.AÑO,E1.MES) AND ACTIVO = 'S'`,
      { empresa: sCompania, anio: sY, mes: sM },
    );

    if (activos.length === 0) continue;

    await addSheetFromQuery(
      workbook,
      "Colaboradores Activos",
      activos,
      () => semanasMes,
      true,
    );

    const nuevos = await cs_query<Record<string, unknown>>(
      `SELECT E.ASEGURADO, E.NOMBRE, E.APELLIDO, E.NOMINA, '03' AS NOVEDAD,
              CIE_BD.ERPADMIN.fecha_formato_inss(E.FECHA_INGRESO) FECHA_NOVEDAD,
              E1.DEVENGADO,
              E.SALARIO_MENSUAL * IIF(E.MONEDA_SALARIO = 'C$',1,(SELECT TC.MONTO FROM ${dbQ}.CIE.TIPO_CAMBIO_HIST TC WHERE TC.FECHA = ${dbQ}.${esqQ}.fUltimo_dia_mes(E1.AÑO,E1.MES))) SALARIO_MENSUAL,
              0 AS APORTE, '11110' AS SEMANAS, '0' AS CENTRO_COSTO,
              E1.DEDUCCION, E1.PATRONAL, E1.INATEC, E.FECHA_INGRESO
       FROM ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS E
       INNER JOIN ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS_1 E1 ON E1.EMPLEADO = E.EMPLEADO
       WHERE E.EMPRESA = @empresa AND E1.AÑO = @anio AND E1.MES = @mes
         AND YEAR(E.FECHA_INGRESO) = @anio AND MONTH(E.FECHA_INGRESO) = @mes`,
      { empresa: sCompania, anio: sY, mes: sM },
    );

    if (nuevos.length > 0) {
      await addSheetFromQuery(
        workbook,
        "Nuevos Ingresos",
        nuevos,
        (idx) => {
          const ingreso = nuevos[idx].FECHA_INGRESO as Date;
          const nSem = cs_iContarSemanas(
            ingreso,
            cs_fUltimoDiaMes(sY, sM),
          );
          const nSemM = cs_iContarSemanas(
            cs_fPrimerDiaMes(sY, sM),
            cs_fUltimoDiaMes(sY, sM),
          );
          return cs_sSemanasINSS_Nuevos(nSem, nSemM);
        },
        true,
      );
    }

    const bajas = await cs_query<Record<string, unknown>>(
      `SELECT E.ASEGURADO, E.NOMBRE, E.APELLIDO, E.NOMINA,
              IIF((ISNULL(E2.DEVENGADO_INSS,0))>0,'02','08') NOVEDAD,
              CIE_BD.ERPADMIN.fecha_formato_inss(E2.FECHA_SALIDA) FECHA_NOVEDAD,
              IIF(E2.DEVENGADO_INSS<0,0,E2.DEVENGADO_INSS) * IIF(E.MONEDA_SALARIO = 'C$',1,(SELECT TC.MONTO FROM CIE_BD.CIE.TIPO_CAMBIO_HIST TC WHERE TC.FECHA = erpadmin.fUltimo_dia_mes(@anio,@mes))) DEVENGADO,
              0 SALARIO_MENSUAL, 0 APORTE, '11110' SEMANAS, E.CENTRO_COSTO CENTRO_COSTO, '' TIPO_EMPLEO,
              (E2.DEDUCCION) * IIF(E.MONEDA_SALARIO = 'C$',1,(SELECT TC.MONTO FROM CIE_BD.CIE.TIPO_CAMBIO_HIST TC WHERE TC.FECHA = erpadmin.fUltimo_dia_mes(@anio,@mes))) DEDUCCION,
              E2.PATRONAL, E2.INATEC, E2.FECHA_SALIDA
       FROM ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS E
       INNER JOIN ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS_2 E2 ON E2.EMPLEADO = E.EMPLEADO
       LEFT JOIN ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS_1 E1 ON E1.EMPLEADO = E2.EMPLEADO AND E1.AÑO = E2.AÑO AND E1.MES = E2.MES
       WHERE E.EMPRESA = @empresa AND E2.AÑO = @anio AND E2.MES = @mes`,
      { empresa: sCompania, anio: sY, mes: sM },
    );

    if (bajas.length > 0) {
      await addSheetFromQuery(
        workbook,
        "Liquidaciones",
        bajas,
        (idx) => {
          const salida = bajas[idx].FECHA_SALIDA as Date;
          const devengado = Number(bajas[idx].DEVENGADO ?? 0);
          let s = cs_sSemanasINSS(
            cs_iContarSemanas(
              cs_fPrimerDiaMes(sY, sM),
              salida,
              "I",
            ),
          );
          if (devengado <= 0) s = "00000";
          return s;
        },
        true,
      );
    }

    const subsidios = await cs_query<Record<string, unknown>>(
      `SELECT E.ASEGURADO, E.NOMBRE, E.APELLIDO, E.NOMINA, '03' AS NOVEDAD,
              ${dbQ}.${esqQ}.fecha_formato_inss(${dbQ}.${esqQ}.fPrimer_dia_mes(E3.AÑO,E3.MES)) FECHA_NOVEDAD,
              (E3.SUBSIDIO_1 + E3.SUBSIDIO_2 + E3.DEVENGADO_INSS) * IIF(E.MONEDA_SALARIO = 'C$',1,(SELECT TC.MONTO FROM CIE_BD.CIE.TIPO_CAMBIO_HIST TC WHERE TC.FECHA = erpadmin.fUltimo_dia_mes(@anio,@mes))) DEVENGADO_INSS,
              0 SALARIO_MENSUAL, 0 APORTE, '' SEMANAS, E.CENTRO_COSTO CENTRO_COSTO, '' TIPO_EMPLEO,
              (E3.DEDUCCION) * IIF(E.MONEDA_SALARIO = 'C$',1,(SELECT TC.MONTO FROM CIE_BD.CIE.TIPO_CAMBIO_HIST TC WHERE TC.FECHA = erpadmin.fUltimo_dia_mes(@anio,@mes))) DEDUCCION,
              E3.PATRONAL, E3.INATEC
       FROM ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS E
       INNER JOIN ${dbQ}.${esqQ}.vwEMPLEADO_INFO_INSS_3 E3 ON E3.EMPLEADO = E.EMPLEADO
       WHERE E.EMPRESA = @empresa AND E3.AÑO = @anio AND E3.MES = @mes`,
      { empresa: sCompania, anio: sY, mes: sM },
    );

    if (subsidios.length > 0) {
      await addSheetFromQuery(
        workbook,
        "Subsidios",
        subsidios,
        () => semanasMes,
        true,
      );
    }

    const verifica = await cs_query<Record<string, unknown>>(
      `SELECT BT.[EMPLEADO], E.NOMBRE, E.APELLIDO, E.ASEGURADO, BT.[SALARIO], BT.[SUBSIDIO],
              BT.[HORAS EXTRAS], BT.[BONO EVENTUAL], BT.[VACACIONES DESCANSADAS], BT.[VACACIONES PAGADAS],
              BT.[RETROACTIVO], BT.[BONO COORDINADORES], BT.[BONO TERAPEUTAS], BT.[TOTAL INGRESOS],
              BT.[INSS LABORAL], BT.[INSS PATRONAL], BT.[INATEC]
       FROM [ERPADMIN].[vwEMPLEADO_INFO_INSS_BT] BT
       INNER JOIN [ERPADMIN].[vwEMPLEADO_INFO_INSS] E ON E.EMPLEADO = BT.EMPLEADO
       WHERE BT.AÑO = @anio AND BT.MES = @mes`,
      { anio: sY, mes: sM },
    );

    if (verifica.length > 0) {
      await addSheetFromQuery(workbook, "Verificación Planilla", verifica);
    }

    const buf = Buffer.from(await workbook.xlsx.writeBuffer());
    zip.file(`Reporte de INSS - ${sCompania}.xlsx`, buf);
    files++;
  }

  if (files === 0) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Sin datos");
    ws.addRow(["Sin registros para el período"]);
    const buf = Buffer.from(await wb.xlsx.writeBuffer());
    return {
      kind: "single",
      filename: "Reporte de INSS - vacio.xlsx",
      buffer: buf,
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return {
    kind: "zip",
    filename: `Reporte de INSS ${sY}-${sM}.zip`,
    buffer: zipBuffer,
  };
}
