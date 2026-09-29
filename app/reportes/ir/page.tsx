"use client";

import { useState } from "react";
import { CS_DownloadButton } from "@/components/CS_DownloadButton";
import { CS_MonthPicker } from "@/components/CS_MonthPicker";
import { CS_ReportFormShell } from "@/components/CS_ReportFormShell";

export default function IrPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  return (
    <CS_ReportFormShell title="Reporte IR" description="Retención IR laboral por mes.">
      <div className="space-y-4">
        <CS_MonthPicker
          year={year}
          month={month}
          onChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
        <CS_DownloadButton slug="ir" body={{ year, month }} />
      </div>
    </CS_ReportFormShell>
  );
}
