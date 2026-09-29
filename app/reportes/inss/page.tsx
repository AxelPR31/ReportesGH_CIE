"use client";

import { useState } from "react";
import { CS_DownloadButton } from "@/components/CS_DownloadButton";
import { CS_MonthPicker } from "@/components/CS_MonthPicker";
import { CS_ReportFormShell } from "@/components/CS_ReportFormShell";

export default function InssPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  return (
    <CS_ReportFormShell
      title="Reporte INSS"
      description="Un archivo por empresa (ZIP si hay varias)."
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
        <CS_DownloadButton slug="inss" body={{ year, month }} />
      </div>
    </CS_ReportFormShell>
  );
}
