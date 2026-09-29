"use client";

import { useState } from "react";

type Props = {
  slug: string;
  body?: Record<string, unknown>;
  label?: string;
  disabled?: boolean;
};

export function CS_DownloadButton({
  slug,
  body = {},
  label = "Generar Excel",
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reportes/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al generar el reporte");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `reporte-${slug}.xlsx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        className="cs-btn-primary"
      >
        {loading ? "Generando…" : label}
      </button>
      {error ? (
        <p className="text-sm font-medium text-cie-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
