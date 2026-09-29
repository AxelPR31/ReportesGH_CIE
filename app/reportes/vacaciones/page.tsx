"use client";

import { useState } from "react";
import { CS_DownloadButton } from "@/components/CS_DownloadButton";
import { CS_MonthPicker } from "@/components/CS_MonthPicker";
import { CS_ReportFormShell } from "@/components/CS_ReportFormShell";

export default function VacacionesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  return (
    <CS_ReportFormShell
      title="Reporte de Vacaciones (General)"
      description="Saldo, goce M-3 a M y remuneración."
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
        <CS_DownloadButton slug="vacaciones" body={{ year, month }} />
      </div>
    </CS_ReportFormShell>
  );
}
