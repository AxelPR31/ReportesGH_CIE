"use client";

import { CS_DownloadButton } from "@/components/CS_DownloadButton";
import { CS_ReportFormShell } from "@/components/CS_ReportFormShell";

export default function ColaboradoresSexoPage() {
  return (
    <CS_ReportFormShell
      title="Colaboradores por sexo"
      description="Genera el archivo con hojas Mujeres y Varones."
    >
      <CS_DownloadButton slug="colaboradores-sexo" body={{}} />
    </CS_ReportFormShell>
  );
}
