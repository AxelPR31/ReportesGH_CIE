export type CS_MonthReportParams = {
  year: number;
  month: number;
};

export type CS_DateReportParams = {
  cutDate: string;
  /** frmReporteIndemGeneral textBox1 — Filtro Empleados */
  empleadoFiltro?: string;
};

export type CS_LiquidacionesParams = {
  empresa: string;
  includeAportes: boolean;
  includeBeneficios: boolean;
  includeDeducciones: boolean;
  includeBases: boolean;
  fechaLiqIni?: string;
  fechaLiqFin?: string;
  fechaRetiroIni?: string;
  fechaRetiroFin?: string;
  empleadoIni?: string;
  empleadoFin?: string;
  liquidacionIni?: string;
  liquidacionFin?: string;
};

export type CS_PowerBiParams = {
  personal: boolean;
  rotacion: boolean;
  ausentismo: boolean;
  empresas: boolean;
  municipios: boolean;
};

export type CS_ReportResult =
  | { kind: "single"; filename: string; buffer: Buffer; mime: string }
  | { kind: "zip"; filename: string; buffer: Buffer };
