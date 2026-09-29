import Link from "next/link";
import { CS_ReportMenuIcon } from "@/components/CS_ReportMenuIcon";
import { CS_REPORT_MENU } from "@/lib/reports/cs_report_registry";

const CARD_ACCENTS = [
  "border-l-cie-blue",
  "border-l-cie-red",
  "border-l-cie-yellow",
] as const;

const ICON_BG = [
  "bg-cie-blue/10 text-cie-blue group-hover:bg-cie-blue group-hover:text-white",
  "bg-cie-red/10 text-cie-red group-hover:bg-cie-red group-hover:text-white",
  "bg-cie-yellow/20 text-cie-blue-dark group-hover:bg-cie-yellow group-hover:text-cie-blue-dark",
] as const;

export default function HomePage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="cs-card border-l-4 border-l-cie-blue">
        <h1 className="text-2xl font-bold text-cie-blue-dark sm:text-3xl">
          Reportes
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cie-muted sm:text-base">
          Elija un reporte, configure los parámetros y descargue el archivo Excel
          generado.
        </p>
      </section>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2 xl:gap-5">
        {CS_REPORT_MENU.map((item, index) => {
          const accent = index % CARD_ACCENTS.length;
          return (
            <li key={item.slug}>
              <Link
                href={item.href}
                className={`cs-report-card group flex h-full flex-col ${CARD_ACCENTS[accent]}`}
              >
                <div className="relative flex items-start gap-3 sm:gap-4">
                  <span
                    className={`cs-report-card-icon flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12 ${ICON_BG[accent]}`}
                  >
                    <CS_ReportMenuIcon slug={item.slug} className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-cie-blue-dark transition-colors duration-300 group-hover:text-cie-blue">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-cie-muted transition-colors duration-300 group-hover:text-foreground/80">
                      {item.description}
                    </p>
                  </div>
                </div>
                <span className="relative mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-medium text-cie-red sm:text-sm">
                  <span className="cs-report-card-cta-icon flex size-8 items-center justify-center rounded-lg border border-cie-red/20 bg-cie-red/5 text-cie-red group-hover:border-cie-red/40 group-hover:bg-cie-red/10">
                    <CS_ReportMenuIcon slug={item.slug} className="size-4" />
                  </span>
                  Abrir reporte
                  <span aria-hidden className="cs-report-card-arrow">
                    →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
