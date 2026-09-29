"use client";

import { useState } from "react";
import { CS_DownloadButton } from "@/components/CS_DownloadButton";
import { CS_ReportFormShell } from "@/components/CS_ReportFormShell";

export default function PowerBiPage() {
  const [personal, setPersonal] = useState(true);
  const [rotacion, setRotacion] = useState(true);
  const [ausentismo, setAusentismo] = useState(true);
  const [empresas, setEmpresas] = useState(true);
  const [municipios, setMunicipios] = useState(false);

  return (
    <CS_ReportFormShell
      title="Actualizar Reportes Power BI"
      description="Exporta archivos para alimentar modelos Power BI."
    >
      <div className="grid gap-2 sm:grid-cols-1">
        {[
          ["personal", personal, setPersonal, "Información del Personal"],
          ["rotacion", rotacion, setRotacion, "Rotación de Personal"],
          ["ausentismo", ausentismo, setAusentismo, "Ausentismo de Personal"],
          ["empresas", empresas, setEmpresas, "Catálogo de Empresas"],
          ["municipios", municipios, setMunicipios, "Catálogo de Municipios"],
        ].map(([key, checked, setter, label]) => (
          <label
            key={key as string}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-cie-blue/10 bg-cie-input-bg/50 px-3 py-2 text-sm text-foreground transition hover:bg-cie-blue/10 sm:px-4"
          >
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-cie-blue"
              checked={checked as boolean}
              onChange={(e) =>
                (setter as (v: boolean) => void)(e.target.checked)
              }
            />
            {label as string}
          </label>
        ))}
      </div>
      <div className="mt-6 border-t border-cie-blue/10 pt-6">
        <CS_DownloadButton
          slug="power-bi"
          body={{ personal, rotacion, ausentismo, empresas, municipios }}
        />
      </div>
    </CS_ReportFormShell>
  );
}
