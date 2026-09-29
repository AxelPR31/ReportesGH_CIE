import ExcelJS from "exceljs";
import { getCS_SqlDatabase } from "@/lib/config/cs_env";
import {
  assertCS_EmpresaAllowed,
  resolveCS_DataDatabase,
} from "@/lib/catalogos/cs_empresas";
import { cs_bracketIdentifier, cs_query } from "@/lib/db/cs_sql_pool";
import { cs_validaFiltrosLiquidaciones } from "@/lib/reports/liquidaciones/cs_valida_filtros";
import type {
  CS_LiquidacionesParams,
  CS_ReportResult,
} from "@/types/CS_ReportJobParams";

type CS_Concepto = { DESCRIPCION: string };

function fFechaCadena(d: Date): string {
  const Y = d.getFullYear().toString();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  return `${Y}${M}${D}`;
}

async function loadConceptos(
  dataDb: string,
  empresa: string,
  tipo: string,
): Promise<string[]> {
  const db = cs_bracketIdentifier(dataDb);
  const emp = cs_bracketIdentifier(empresa);
  const rows = await cs_query<CS_Concepto>(
    `SELECT DESCRIPCION FROM ${db}.${emp}.CONCEPTO WHERE TIPO_CONCEPTO = @tipo ORDER BY CONCEPTO`,
    { tipo },
  );
  return rows.map((r) => r.DESCRIPCION);
}

/** frmReporteLiquidaciones.cs */
export async function runCS_LiquidacionesReport(
  params: CS_LiquidacionesParams,
): Promise<CS_ReportResult> {
  const nFiltro = cs_validaFiltrosLiquidaciones(params);
  if (nFiltro === 0) {
    throw new Error("Filtros no válidos");
  }

  await assertCS_EmpresaAllowed(params.empresa);
  const sEmpresa = params.empresa;
  const sDataB = resolveCS_DataDatabase(sEmpresa);
  const empQ = cs_bracketIdentifier(sEmpresa);
  const dataDbQ = cs_bracketIdentifier(sDataB);

  const sSQLLiquidacion =
    "[LIQUIDACION] '#Liquidación', [EMPLEADO] 'Empleado',[FECHA_INGRESO] 'Fecha Ingreso',[FECHA_SALIDA] 'Fecha Salida',[NUMERO_ACCION] 'Acción', DESCRIPCION,[ASIENTO_CONTABLE] 'Asiento',[FECHA_RETIRO_PAGO] 'Retiro Pago',[OBSERVACIONES] 'Observaciones'";
  const sSQLEmpleado =
    ",[NOMBRE] 'Nombre',[IDENTIFICACION] 'Identifición',[ASEGURADO] '#Seguro',[CENTRO_COSTO] 'CENTRO DE COSTO',[DESCRIPCION CENTRO] 'DESCRIPCION CENTRO',[PUESTO] 'PUESTO', [DESCRIPCION PUESTO] 'DESCRIPCION PUESTO'";

  const headers: string[] = [
    " Liquidación",
    " Empleado",
    " Fecha Ingreso",
    " Fecha Salida",
    " # Acción",
    " Tipo Acción",
    " Asiento Contable",
    " Fecha Pago",
    " Observaciones",
    " Nombre",
    " Identificación",
    " # Seguro ",
    " Centro de Costo ",
    " Descripción Centro ",
    " Puesto ",
    " Descripción Puesto ",
  ];

  let sSQLAportes = "";
  let sSQLBeneficios = "";
  let sSQLDeduccion = "";
  let sSQLBases = "";
  let nAportes = 0;
  let nBeneficios = 0;
  let nDeducciones = 0;
  let nBases = 0;

  if (
    params.includeAportes &&
    getCS_SqlDatabase() === "IBEX_HR"
  ) {
    const conceptos = await loadConceptos(getCS_SqlDatabase(), sEmpresa, "W");
    nAportes = conceptos.length * 3;
    for (const desc of conceptos) {
      ["Cantidad", "Monto", "Total"].forEach((p) => {
        const h = `${p} ${desc}`;
        headers.push(h);
        sSQLAportes += `,[${h}]`;
      });
    }
    headers.push("Total Aportes");
  }

  if (params.includeBeneficios) {
    const conceptos = await loadConceptos(sDataB, sEmpresa, "X");
    nBeneficios = conceptos.length * 3;
    for (const desc of conceptos) {
      ["Cantidad", "Monto", "Total"].forEach((p) => {
        const h = `${p} ${desc}`;
        headers.push(h);
        sSQLBeneficios += `,[${h}]`;
      });
    }
    headers.push("Total Beneficios");
  }

  if (params.includeDeducciones) {
    const conceptos = await loadConceptos(sDataB, sEmpresa, "Y");
    nDeducciones = conceptos.length * 3;
    for (const desc of conceptos) {
      ["Cantidad", "Monto", "Total"].forEach((p) => {
        const h = `${p} ${desc}`;
        headers.push(h);
        sSQLDeduccion += `,[${h}]`;
      });
    }
    headers.push("Total Deducciones");
  }

  if (params.includeBases) {
    const conceptos = await loadConceptos(getCS_SqlDatabase(), sEmpresa, "Z");
    nBases = conceptos.length * 3;
    for (const desc of conceptos) {
      ["Cantidad", "Monto", "Total"].forEach((p) => {
        const h = `${p} ${desc}`;
        headers.push(h);
        sSQLBases += `,[${h}]`;
      });
    }
    headers.push("Total Bases");
  }

  headers.push("Neto a Pagar");

  let sSQLFiltros = "";
  switch (nFiltro) {
    case 1:
      sSQLFiltros = `WHERE FECHA_SALIDA >= '${fFechaCadena(new Date(params.fechaLiqIni!))}' AND FECHA_SALIDA <= '${fFechaCadena(new Date(params.fechaLiqFin!))}'`;
      break;
    case 2:
      sSQLFiltros = `WHERE FECHA_RETIRO_PAGO >= '${fFechaCadena(new Date(params.fechaRetiroIni!))}' AND FECHA_RETIRO_PAGO <= '${fFechaCadena(new Date(params.fechaRetiroFin!))}'`;
      break;
    case 3:
      sSQLFiltros = `WHERE EMPLEADO >= '${params.empleadoIni}' AND EMPLEADO <= '${params.empleadoFin}'`;
      break;
    case 4:
      sSQLFiltros = `WHERE LIQUIDACION >= '${params.liquidacionIni}' AND LIQUIDACION <= '${params.liquidacionFin}'`;
      break;
    case 5:
      sSQLFiltros = "";
      break;
  }

  const sSQLString = `SELECT ${sSQLLiquidacion} ${sSQLEmpleado} ${sSQLAportes} ${sSQLBeneficios} ${sSQLDeduccion} ${sSQLBases} FROM ${dataDbQ}.${empQ}.[vwLIQUIDACION_EMPLEADO] ${sSQLFiltros} ORDER BY LIQUIDACION`;

  const tbl = await cs_query<Record<string, unknown>>(sSQLString);

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Liquidaciones");
  ws.getRow(7).values = headers;

  let rowIndex = 8;
  for (const dr of tbl) {
    const values = Object.values(dr).map((v) =>
      v instanceof Date ? v.toISOString().slice(0, 10) : v,
    ) as (string | number | null)[];

    let col = 16;
    let nI = 16;
    let nTotalAportes = 0;
    let nTotalBeneficios = 0;
    let nTotalDeducciones = 0;
    const rowValues: (string | number | null)[] = values.slice(0, 16);

    const processBlock = (count: number, addToTotal: (n: number) => void) => {
      let control = 0;
      for (let l = nI; l < nI + count; l++) {
        const val = Number(values[l - 1] ?? 0);
        rowValues.push(val);
        control++;
        if (control === 3) {
          addToTotal(val);
          control = 0;
        }
        nI++;
      }
    };

    if (params.includeAportes && nAportes > 0) {
      processBlock(nAportes, (n) => {
        nTotalAportes += n;
      });
      rowValues.push(nTotalAportes);
    }
    if (params.includeBeneficios) {
      processBlock(nBeneficios, (n) => {
        nTotalBeneficios += n;
      });
      rowValues.push(nTotalBeneficios);
    }
    if (params.includeDeducciones) {
      processBlock(nDeducciones, (n) => {
        nTotalDeducciones += n;
      });
      rowValues.push(nTotalDeducciones);
    }
    if (params.includeBases) {
      processBlock(nBases, () => {});
    }
    if (params.includeBeneficios && params.includeDeducciones) {
      rowValues.push(nTotalBeneficios - nTotalDeducciones);
    } else {
      rowValues.push(null);
    }

    ws.getRow(rowIndex).values = rowValues;
    rowIndex++;
  }

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  return {
    kind: "single",
    filename: `${sEmpresa} - Columnar Liquidaciones.xlsx`,
    buffer,
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
