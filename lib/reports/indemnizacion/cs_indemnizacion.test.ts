import { describe, expect, it } from "vitest";
import {
  cs_calcularAMD,
  cs_calcularIndemnizacion,
} from "@/lib/reports/indemnizacion/cs_indemnizacion";

describe("cs_calcularIndemnizacion", () => {
  it("aplica 5 salarios con 6 o más años", () => {
    expect(cs_calcularIndemnizacion(30000, 6, 0, 0)).toBe(150000);
  });

  it("calcula año cero solo con meses", () => {
    const v = cs_calcularIndemnizacion(30000, 0, 6, 0);
    expect(v).toBeGreaterThan(0);
  });
});

describe("cs_calcularAMD", () => {
  it("retorna cero si fecha inicio es posterior", () => {
    const r = cs_calcularAMD(new Date(2025, 5, 1), new Date(2024, 0, 1));
    expect(r).toEqual({ years: 0, months: 0, days: 0 });
  });
});
