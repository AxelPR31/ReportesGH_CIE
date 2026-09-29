/** frmReporteINSS.cs — lógica de semanas INSS */

export function cs_fPrimerDiaMes(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

export function cs_fUltimoDiaMes(year: number, month: number): Date {
  return new Date(year, month, 0);
}

export function cs_iContarSemanas(
  inicio: Date,
  final: Date,
  sTipoSemana: "C" | "I" = "C",
): number {
  let cursor = new Date(inicio);
  const end = new Date(final);
  let retorno = 0;
  let control = 0;
  const difDias = Math.floor(
    (end.getTime() - cursor.getTime()) / (1000 * 60 * 60 * 24),
  );
  for (let i = 0; i <= difDias; i++) {
    control++;
    if (cursor.getDay() === 6) {
      retorno++;
      control = 0;
    }
    cursor = new Date(cursor.getTime() + 86400000);
  }
  if (sTipoSemana === "I" && retorno < 5) {
    retorno += control !== 0 ? 1 : 0;
  }
  return retorno;
}

export function cs_sSemanasINSS(semanas: number): string {
  const retorno = "1".repeat(Math.min(semanas, 5));
  return retorno + "0".repeat(5 - retorno.length);
}

export function cs_sSemanasINSS_Nuevos(
  semanas: number,
  semanasM: number,
): string {
  let retorno = "1".repeat(Math.min(semanas, 5));
  retorno = "0".repeat(semanasM - retorno.length) + retorno;
  return retorno + (semanasM === 4 ? "0" : "");
}

export function cs_buildInssCsvRow(
  values: (string | number | Date | null | undefined)[],
): string {
  return values
    .map((v) => {
      if (v === null || v === undefined) return "";
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      return String(v);
    })
    .join(";");
}
