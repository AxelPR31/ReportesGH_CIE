import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
};

export function CS_ReportFormShell({
  title,
  description,
  children,
  wide,
}: Props) {
  return (
    <div
      className={`mx-auto w-full space-y-6 ${wide ? "max-w-6xl" : "max-w-3xl"}`}
    >
      <div>
        <Link
          href="/"
          className="inline-flex min-h-10 items-center text-sm font-medium text-cie-blue hover:text-cie-blue-dark"
        >
          ← Volver a reportes
        </Link>
        <h1 className="mt-3 text-xl font-bold text-cie-blue-dark sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-cie-muted sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      <div className="cs-card">{children}</div>
    </div>
  );
}
