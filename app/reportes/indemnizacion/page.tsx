"use client";

import { useState } from "react";
import { CS_DownloadButton } from "@/components/CS_DownloadButton";
import { CS_ReportFormShell } from "@/components/CS_ReportFormShell";

export default function IndemnizacionPage() {
  const [cutDate, setCutDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [empleadoFiltro, setEmpleadoFiltro] = useState("");

  return (
    <CS_ReportFormShell
      title="Reporte de Indemnización (General)"
      description="Fecha de corte para cálculo de prestaciones."
    >
      <div className="space-y-5">
        <label className="cs-label">
          Fecha de corte
          <input
            type="date"
            className="cs-input"
            value={cutDate}
            onChange={(e) => setCutDate(e.target.value)}
          />
        </label>
        <fieldset className="cs-fieldset">
          <legend className="cs-fieldset-legend">Filtro empleados</legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              className="cs-input min-w-0 flex-1"
              value={empleadoFiltro}
              placeholder="Código o nombre de empleado"
              onChange={(e) => setEmpleadoFiltro(e.target.value)}
            />
            <span
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-cie-blue/20 bg-cie-surface px-4 text-cie-blue"
              title="Filtro de empleados"
              aria-hidden
            >
              ⏷
            </span>
          </div>
        </fieldset>
        <CS_DownloadButton
          slug="indemnizacion"
          body={{
            cutDate,
            empleadoFiltro: empleadoFiltro.trim() || undefined,
          }}
        />
      </div>
    </CS_ReportFormShell>
  );
}
