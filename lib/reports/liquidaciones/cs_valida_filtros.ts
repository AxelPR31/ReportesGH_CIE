/** Port de frmReporteLiquidaciones.nValidaFiltros */

export type CS_LiquidacionesFilterInput = {
  empresa: string;
  fechaLiqIni?: string;
  fechaLiqFin?: string;
  fechaRetiroIni?: string;
  fechaRetiroFin?: string;
  empleadoIni?: string;
  empleadoFin?: string;
  liquidacionIni?: string;
  liquidacionFin?: string;
};

export type CS_LiquidacionesFilterMode =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5;

export function cs_validaFiltrosLiquidaciones(
  input: CS_LiquidacionesFilterInput,
): CS_LiquidacionesFilterMode {
  let retorno: CS_LiquidacionesFilterMode = 5;

  if (!input.empresa) {
    return 0;
  }

  const empty = (v?: string) => !v || v.trim() === "";

  if (
    empty(input.fechaLiqIni) &&
    empty(input.fechaLiqFin) &&
    empty(input.fechaRetiroIni) &&
    empty(input.fechaRetiroFin) &&
    empty(input.empleadoIni) &&
    empty(input.empleadoFin) &&
    empty(input.liquidacionIni) &&
    empty(input.liquidacionFin)
  ) {
    return retorno;
  }

  if (!empty(input.fechaLiqIni) && !empty(input.fechaLiqFin)) {
    return new Date(input.fechaLiqIni!) <= new Date(input.fechaLiqFin!) ? 1 : 0;
  }
  if (empty(input.fechaLiqIni) !== empty(input.fechaLiqFin)) {
    retorno = 0;
  }

  if (!empty(input.fechaRetiroIni) && !empty(input.fechaRetiroFin)) {
    return new Date(input.fechaRetiroIni!) <= new Date(input.fechaRetiroFin!)
      ? 2
      : 0;
  }
  if (empty(input.fechaRetiroIni) !== empty(input.fechaRetiroFin)) {
    retorno = 0;
  }

  if (!empty(input.empleadoIni) && !empty(input.empleadoFin)) {
    const ini = Number(input.empleadoIni);
    const fin = Number(input.empleadoFin);
    if (Number.isNaN(ini) || Number.isNaN(fin)) return 0;
    return fin >= ini ? 3 : 0;
  }
  if (empty(input.empleadoIni) !== empty(input.empleadoFin)) {
    retorno = 0;
  }

  if (!empty(input.liquidacionIni) && !empty(input.liquidacionFin)) {
    const ini = Number(input.liquidacionIni);
    const fin = Number(input.liquidacionFin);
    if (Number.isNaN(ini) || Number.isNaN(fin)) return 0;
    return fin >= ini ? 4 : 0;
  }
  if (empty(input.liquidacionIni) !== empty(input.liquidacionFin)) {
    retorno = 0;
  }

  return 0;
}
