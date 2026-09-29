import { runCS_CumpleanosReport } from "@/lib/reports/cumpleanos/cs_cumpleanos_report";
import { runCS_InssReport } from "@/lib/reports/inss/cs_inss_report";
import { runCS_IrReport } from "@/lib/reports/ir/cs_ir_report";
import { runCS_IndemnizacionReport } from "@/lib/reports/indemnizacion/cs_indemnizacion_report";
import { runCS_LiquidacionesReport } from "@/lib/reports/liquidaciones/cs_liquidaciones_report";
import { runCS_PowerBiReport } from "@/lib/reports/powerbi/cs_powerbi_exports";
import { runCS_SexoReport } from "@/lib/reports/sexo/cs_sexo_report";
import { runCS_VacacionesReport } from "@/lib/reports/vacaciones/cs_vacaciones_report";
import type { CS_ReportResult } from "@/types/CS_ReportJobParams";

export type CS_ReportSlug =
  | "colaboradores-sexo"
  | "cumpleanios"
  | "power-bi"
  | "ir"
  | "vacaciones"
  | "indemnizacion"
  | "inss"
  | "liquidaciones";

export async function runCS_Report(
  slug: CS_ReportSlug,
  body: unknown,
): Promise<CS_ReportResult> {
  switch (slug) {
    case "colaboradores-sexo":
      return runCS_SexoReport();
    case "cumpleanios": {
      const { year, month } = body as { year: number; month: number };
      return runCS_CumpleanosReport({ year, month });
    }
    case "power-bi":
      return runCS_PowerBiReport(
        body as import("@/types/CS_ReportJobParams").CS_PowerBiParams,
      );
    case "ir": {
      const { year, month } = body as { year: number; month: number };
      return runCS_IrReport({ year, month });
    }
    case "vacaciones": {
      const { year, month } = body as { year: number; month: number };
      return runCS_VacacionesReport({ year, month });
    }
    case "indemnizacion": {
      const { cutDate, empleadoFiltro } = body as {
        cutDate: string;
        empleadoFiltro?: string;
      };
      return runCS_IndemnizacionReport({ cutDate, empleadoFiltro });
    }
    case "inss": {
      const { year, month } = body as { year: number; month: number };
      return runCS_InssReport({ year, month });
    }
    case "liquidaciones":
      return runCS_LiquidacionesReport(
        body as import("@/types/CS_ReportJobParams").CS_LiquidacionesParams,
      );
    default:
      throw new Error(`Reporte no soportado: ${slug}`);
  }
}

export const CS_REPORT_MENU: {
  slug: CS_ReportSlug;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    slug: "inss",
    title: "Reporte INSS",
    description: "Planilla INSS por empresa y mes",
    href: "/reportes/inss",
  },
  {
    slug: "cumpleanios",
    title: "Cumpleaños y Aniversarios",
    description: "Por mes de nacimiento e ingreso",
    href: "/reportes/cumpleanios",
  },
  {
    slug: "colaboradores-sexo",
    title: "Colaboradores por sexo",
    description: "Listado M/F en Excel",
    href: "/reportes/colaboradores-sexo",
  },
  {
    slug: "ir",
    title: "Reporte IR",
    description: "Retención impuesto sobre la renta",
    href: "/reportes/ir",
  },
  {
    slug: "vacaciones",
    title: "Vacaciones (General)",
    description: "Saldo y goce mensual",
    href: "/reportes/vacaciones",
  },
  {
    slug: "indemnizacion",
    title: "Indemnización (General)",
    description: "Provisión a fecha de corte",
    href: "/reportes/indemnizacion",
  },
  {
    slug: "liquidaciones",
    title: "Columnar Liquidaciones",
    description: "Detalle columnar por empresa",
    href: "/reportes/liquidaciones",
  },
  {
    slug: "power-bi",
    title: "Actualizar Power BI",
    description: "Exports para modelos BI",
    href: "/reportes/power-bi",
  },
];
