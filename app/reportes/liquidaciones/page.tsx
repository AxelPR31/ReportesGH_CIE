"use client";

import { useMemo, useState } from "react";
import { CS_CompanySelect } from "@/components/CS_CompanySelect";
import { CS_DownloadButton } from "@/components/CS_DownloadButton";
import { CS_ReportFormShell } from "@/components/CS_ReportFormShell";

function hasText(v: string) {
  return v.trim() !== "";
}

export default function LiquidacionesPage() {
  const [empresa, setEmpresa] = useState("");
  const [includeAportes, setIncludeAportes] = useState(true);
  const [includeBeneficios, setIncludeBeneficios] = useState(true);
  const [includeDeducciones, setIncludeDeducciones] = useState(true);
  const [includeBases, setIncludeBases] = useState(false);

  const [fechaLiqIni, setFechaLiqIni] = useState("");
  const [fechaLiqFin, setFechaLiqFin] = useState("");
  const [fechaRetiroIni, setFechaRetiroIni] = useState("");
  const [fechaRetiroFin, setFechaRetiroFin] = useState("");
  const [empleadoIni, setEmpleadoIni] = useState("");
  const [empleadoFin, setEmpleadoFin] = useState("");
  const [liquidacionIni, setLiquidacionIni] = useState("");
  const [liquidacionFin, setLiquidacionFin] = useState("");

  const active = useMemo(() => {
    const emp = hasText(empleadoIni) || hasText(empleadoFin);
    const liq = hasText(liquidacionIni) || hasText(liquidacionFin);
    const fecLiq = hasText(fechaLiqIni) || hasText(fechaLiqFin);
    const fecRet = hasText(fechaRetiroIni) || hasText(fechaRetiroFin);
    return { emp, liq, fecLiq, fecRet };
  }, [
    empleadoIni,
    empleadoFin,
    liquidacionIni,
    liquidacionFin,
    fechaLiqIni,
    fechaLiqFin,
    fechaRetiroIni,
    fechaRetiroFin,
  ]);

  const disableFecLiq = active.emp || active.liq || active.fecRet;
  const disableFecRet = active.emp || active.liq || active.fecLiq;
  const disableEmp = active.liq || active.fecLiq || active.fecRet;
  const disableLiq = active.emp || active.fecLiq || active.fecRet;

  const nomArchivo =
    (process.env.NEXT_PUBLIC_CS_EXPORT_CARPETA ?? "C:\\Reportes GH\\") +
    (empresa || "") +
    " - Columnar Liquidaciones";

  const body = {
    empresa,
    includeAportes,
    includeBeneficios,
    includeDeducciones,
    includeBases,
    fechaLiqIni: fechaLiqIni || undefined,
    fechaLiqFin: fechaLiqFin || undefined,
    fechaRetiroIni: fechaRetiroIni || undefined,
    fechaRetiroFin: fechaRetiroFin || undefined,
    empleadoIni: empleadoIni || undefined,
    empleadoFin: empleadoFin || undefined,
    liquidacionIni: liquidacionIni || undefined,
    liquidacionFin: liquidacionFin || undefined,
  };

  return (
    <CS_ReportFormShell
      wide
      title="Reporte Columnar de Liquidaciones"
      description="Filtre por fechas, empleado o liquidación. Solo un tipo de filtro principal puede usarse a la vez."
    >
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <div className="space-y-4 md:col-span-2">
          <CS_CompanySelect value={empresa} onChange={setEmpresa} />
        </div>

        <fieldset
          className="cs-fieldset space-y-2"
          disabled={disableFecLiq}
        >
          <legend className="text-sm font-medium text-cie-blue-dark">
            Por Fecha de Liquidación
          </legend>
          <label className="block text-sm text-cie-muted">
            De
            <input
              type="date"
              className="cs-input mt-1.5"
              value={fechaLiqIni}
              onChange={(e) => setFechaLiqIni(e.target.value)}
            />
          </label>
          <label className="block text-sm text-cie-muted">
            A
            <input
              type="date"
              className="cs-input mt-1.5"
              value={fechaLiqFin}
              onChange={(e) => setFechaLiqFin(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset
          className="cs-fieldset space-y-2"
          disabled={disableFecRet}
        >
          <legend className="text-sm font-medium text-cie-blue-dark">
            Por Fecha de Retiro de Pago
          </legend>
          <label className="block text-sm text-cie-muted">
            De
            <input
              type="date"
              className="cs-input mt-1.5"
              value={fechaRetiroIni}
              onChange={(e) => setFechaRetiroIni(e.target.value)}
            />
          </label>
          <label className="block text-sm text-cie-muted">
            A
            <input
              type="date"
              className="cs-input mt-1.5"
              value={fechaRetiroFin}
              onChange={(e) => setFechaRetiroFin(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset
          className="cs-fieldset space-y-2"
          disabled={disableEmp}
        >
          <legend className="text-sm font-medium text-cie-blue-dark">
            Por número de Empleado
          </legend>
          <label className="block text-sm text-cie-muted">
            De Empleado
            <input
              inputMode="numeric"
              className="cs-input mt-1.5"
              value={empleadoIni}
              onChange={(e) =>
                setEmpleadoIni(e.target.value.replace(/\D/g, ""))
              }
            />
          </label>
          <label className="block text-sm text-cie-muted">
            A Empleado
            <input
              inputMode="numeric"
              className="cs-input mt-1.5"
              value={empleadoFin}
              onChange={(e) =>
                setEmpleadoFin(e.target.value.replace(/\D/g, ""))
              }
            />
          </label>
        </fieldset>

        <fieldset
          className="cs-fieldset space-y-2"
          disabled={disableLiq}
        >
          <legend className="text-sm font-medium text-cie-blue-dark">
            Por número de Liquidación
          </legend>
          <label className="block text-sm text-cie-muted">
            De liquidación
            <input
              inputMode="numeric"
              className="cs-input mt-1.5"
              value={liquidacionIni}
              onChange={(e) =>
                setLiquidacionIni(e.target.value.replace(/\D/g, ""))
              }
            />
          </label>
          <label className="block text-sm text-cie-muted">
            A liquidación
            <input
              inputMode="numeric"
              className="cs-input mt-1.5"
              value={liquidacionFin}
              onChange={(e) =>
                setLiquidacionFin(e.target.value.replace(/\D/g, ""))
              }
            />
          </label>
        </fieldset>

        <fieldset className="cs-fieldset space-y-2 md:col-span-2">
          <legend className="text-sm font-medium text-cie-blue-dark">
            Imprimir Conceptos
          </legend>
          {[
            [includeAportes, setIncludeAportes, "Aportes"],
            [includeBeneficios, setIncludeBeneficios, "Beneficios"],
            [includeDeducciones, setIncludeDeducciones, "Deducciones"],
            [includeBases, setIncludeBases, "Bases"],
          ].map(([checked, setter, label]) => (
            <label
              key={label as string}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={checked as boolean}
                onChange={(e) =>
                  (setter as (v: boolean) => void)(e.target.checked)
                }
              />
              {label as string}
            </label>
          ))}
          <fieldset className="mt-2 border-t border-cie-blue/10 pt-3">
            <legend className="text-xs text-cie-muted">Incluir</legend>
            <label className="flex items-center gap-2 text-sm text-cie-muted/70">
              <input type="checkbox" checked disabled readOnly />
              Cantidad
            </label>
            <label className="flex items-center gap-2 text-sm text-cie-muted/70">
              <input type="checkbox" checked disabled readOnly />
              Monto
            </label>
          </fieldset>
        </fieldset>

        <label className="cs-label md:col-span-2">
          Nombre de archivo
          <input
            readOnly
            className="cs-input bg-cie-surface"
            value={nomArchivo}
          />
        </label>

        <div className="md:col-span-2">
          <CS_DownloadButton
            slug="liquidaciones"
            body={body}
            disabled={!empresa}
          />
        </div>
      </div>
    </CS_ReportFormShell>
  );
}
