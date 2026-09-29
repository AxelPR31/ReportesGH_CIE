"use client";

import { useState } from "react";
import { CS_DownloadButton } from "@/components/CS_DownloadButton";
import { CS_MonthPicker } from "@/components/CS_MonthPicker";
import { CS_ReportFormShell } from "@/components/CS_ReportFormShell";

export default function CumpleaniosPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  return (
    <CS_ReportFormShell
      title="Cumpleaños y Aniversarios"
      description="Mes a generar (cumpleañeros y aniversarios de ingreso)."
    >
      <div className="space-y-4">
        <CS_MonthPicker
          year={year}
          month={month}
          onChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
        <CS_DownloadButton slug="cumpleanios" body={{ year, month }} />
      </div>
    </CS_ReportFormShell>
  );
}
