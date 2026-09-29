"use client";

import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function CS_CompanySelect({ value, onChange }: Props) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalogos/empresas")
      .then((r) => r.json())
      .then((data) => {
        setOptions(
          (data.empresas ?? []).map((e: { conjunto: string }) => e.conjunto),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <label className="cs-label">
      Compañía
      <select
        className="cs-input"
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{loading ? "Cargando…" : "Seleccione…"}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
