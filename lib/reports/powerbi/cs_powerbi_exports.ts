import ExcelJS from "exceljs";
import JSZip from "jszip";
import { getCS_Esquema, getCS_SqlDatabase } from "@/lib/config/cs_env";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import { rowsFromRecordset } from "@/lib/excel/cs_excel_builder";
import type {
  CS_PowerBiParams,
  CS_ReportResult,
} from "@/types/CS_ReportJobParams";

async function exportTable(
  query: string,
  sheetName: string,
  filename: string,
): Promise<{ filename: string; buffer: Buffer }> {
  const rows = await cs_query<Record<string, unknown>>(query);
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(sheetName);
  if (rows.length === 0) {
    ws.addRow(["Sin datos"]);
  } else {
    const { headers, rows: data } = rowsFromRecordset(rows);
    ws.addRow(headers);
    data.forEach((r) => ws.addRow(r));
  }
  return {
    filename,
    buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
  };
}

/** frmPowerBI.cs */
export async function runCS_PowerBiReport(
  params: CS_PowerBiParams,
): Promise<CS_ReportResult> {
  const db = cs_bracketIdentifier(getCS_SqlDatabase());
  const esquema = cs_bracketIdentifier(getCS_Esquema());
  const base = `${db}.${esquema}`;

  const zip = new JSZip();
  const files: { filename: string; buffer: Buffer }[] = [];

  if (params.personal) {
    files.push(
      await exportTable(
        `SELECT [EMPRESA],[EMPLEADO],[NOMBRE],[SEXO],[ACTIVO],[IDENTIFICACION],[FECHA_INGRESO],[DEPARTAMENTO],[FECHA_NACIMIENTO],[CENTRO_COSTO],[DESC_CENTRO_COSTO],[TELEFONO1],[TELEFONO2],[TELEFONO3],[CORREO],[NOMBRE_PADRE],[NOMBRE_MADRE],[NOMBRE_PAREJA],[CANTIDAD_HIJOS],[DIRECCION_HAB],[AÑO_SALIDA],[MES_SALIDA],[FECHA_SALIDA],[SALARIO],[FECHA_EMPRESA],[MES_INGRESO],[AÑO_INGRESO],[MUNICIPIO] FROM ${base}.[vwEMPLEADO_INFO] WHERE [ACTIVO] = 'Sí'`,
        "EMPLEADOS",
        "EMPLEADOS_INFO.xlsx",
      ),
    );
  }
  if (params.rotacion) {
    files.push(
      await exportTable(
        `SELECT [EMPRESA],[FECHA_FINAL],[AÑO],[MES],[EMPLEADOS_INICIAL],[ALTAS],[BAJAS],[EMPLEADOS_FINAL] FROM ${base}.[vwEMPLEADO_ROTACION]`,
        "ROTACION",
        "ROTACION_INFO.xlsx",
      ),
    );
  }
  if (params.ausentismo) {
    files.push(
      await exportTable(
        `SELECT [EMPRESA],[EMPLEADO],[ACTIVO],[CENTRO_COSTO],[DESC_CENTRO_COSTO],[NOMBRE],[SALARIO],[SALARIO_DIARIO],[FECHA],[TIPO_ACCION],[DIAS_ACCION],[MONTO_ACCION],[DESCRIPCION] FROM ${base}.[vwEMPLEADO_AUSENTISMO_DET]`,
        "AUSENTISMO_DET",
        "AUSENTISMO_DET_INFO.xlsx",
      ),
    );
    files.push(
      await exportTable(
        `SELECT [EMPRESA],[FECHA_FINAL],[DIAS],[DIAS_LABORALES],[EMPLEADOS_INICIAL],[EMPLEADOS_FINAL] FROM ${base}.[vwAUSENTISMO_RESU]`,
        "AUSENTISMO_RESU",
        "AUSENTISMO_RESU_INFO.xlsx",
      ),
    );
  }
  if (params.empresas) {
    files.push(
      await exportTable(
        `SELECT [EMPRESA] FROM ${base}.[vwEMPRESA_INFO]`,
        "EMPRESAS",
        "EMPRESAS_INFO.xlsx",
      ),
    );
  }
  if (params.municipios) {
    files.push(
      await exportTable(
        `SELECT [U_CODIGO],[U_DESCRIP] FROM ${db}.CIE.[U_MUNICIPIOS]`,
        "MUNICIPIOS",
        "MUNICIPIOS_INFO.xlsx",
      ),
    );
  }

  if (files.length === 0) {
    throw new Error("Seleccione al menos una opción de exportación");
  }

  for (const f of files) {
    zip.file(`Power BI/${f.filename}`, f.buffer);
  }

  if (files.length === 1) {
    return {
      kind: "single",
      filename: files[0].filename,
      buffer: files[0].buffer,
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  return {
    kind: "zip",
    filename: "Power BI exports.zip",
    buffer: await zip.generateAsync({ type: "nodebuffer" }),
  };
}
