/** frmReporteIndemGeneral.cs — CalcularAMD y CalcularIndemnizacion */

export type CS_Antiguedad = { years: number; months: number; days: number };

export function cs_calcularAMD(
  fechaIni: Date,
  fechaFin: Date,
): CS_Antiguedad {
  let años = 0;
  let meses = 0;
  let dias = 0;
  let fechaCalculo = new Date(fechaIni);

  if (fechaCalculo > fechaFin) {
    return { years: 0, months: 0, days: 0 };
  }

  while (addYears(fechaCalculo, 1) <= fechaFin) {
    años++;
    fechaCalculo = addYears(fechaCalculo, 1);
  }
  while (addMonths(fechaCalculo, 1) <= fechaFin) {
    meses++;
    fechaCalculo = addMonths(fechaCalculo, 1);
  }
  while (addDays(fechaCalculo, 1) <= fechaFin) {
    dias++;
    fechaCalculo = addDays(fechaCalculo, 1);
  }
  if (dias >= 30) {
    meses++;
    dias = 0;
  }
  if ((dias === 28 || dias === 29) && fechaCalculo.getMonth() === 1) {
    meses++;
    dias = 0;
  }
  return { years: años, months: meses, days: dias };
}

export function cs_calcularIndemnizacion(
  salario: number,
  a: number,
  m: number,
  d: number,
): number {
  if (a >= 6) return salario * 5;

  const nSalDiario = Math.round((salario / 30) * 100) / 100;
  let retorno = 0;

  if (a === 5) {
    retorno = salario * 3;
    retorno += Math.round(nSalDiario * 20 * 2 * 100) / 100;
    if (m > 0) retorno += Math.round((nSalDiario * 20 / 12) * m * 100) / 100;
    if (d > 0)
      retorno += Math.round((nSalDiario * 20 / 12 / 30) * d * 100) / 100;
  } else if (a === 4) {
    retorno = salario * 3;
    retorno += Math.round(nSalDiario * 20 * 100) / 100;
    if (m > 0) retorno += Math.round((nSalDiario * 20 / 12) * m * 100) / 100;
    if (d > 0)
      retorno += Math.round((nSalDiario * 20 / 12 / 30) * d * 100) / 100;
  } else if (a === 3) {
    retorno = salario * 3;
    if (m > 0) retorno += Math.round((nSalDiario * 20 / 12) * m * 100) / 100;
    if (d > 0)
      retorno += Math.round((nSalDiario * 20 / 12 / 30) * d * 100) / 100;
  } else if (a === 2) {
    retorno = salario * 2;
    if (m > 0) retorno += Math.round((nSalDiario * 30 / 12) * m * 100) / 100;
    if (d > 0)
      retorno += Math.round((nSalDiario * 30 / 12 / 30) * d * 100) / 100;
  } else if (a === 1) {
    retorno = salario * 1;
    if (m > 0) retorno += Math.round((nSalDiario * 30 / 12) * m * 100) / 100;
    if (d > 0)
      retorno += Math.round((nSalDiario * 30 / 12 / 30) * d * 100) / 100;
  } else if (a === 0) {
    retorno = 0;
    if (m > 0) retorno += Math.round((nSalDiario * 30 / 12) * m * 100) / 100;
    if (d > 0)
      retorno += Math.round((nSalDiario * 30 / 12 / 30) * d * 100) / 100;
  }

  return retorno;
}

function addYears(d: Date, n: number): Date {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + n);
  return x;
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
