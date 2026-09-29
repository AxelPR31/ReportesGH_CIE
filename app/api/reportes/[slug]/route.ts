import { NextResponse } from "next/server";
import { isCS_SqlConfigured } from "@/lib/config/cs_env";
import {
  runCS_Report,
  type CS_ReportSlug,
} from "@/lib/reports/cs_report_registry";

const SLUGS: CS_ReportSlug[] = [
  "colaboradores-sexo",
  "cumpleanios",
  "power-bi",
  "ir",
  "vacaciones",
  "indemnizacion",
  "inss",
  "liquidaciones",
];

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isCS_SqlConfigured()) {
    return NextResponse.json(
      { error: "SQL no configurado en el servidor" },
      { status: 503 },
    );
  }

  const { slug } = await context.params;
  if (!SLUGS.includes(slug as CS_ReportSlug)) {
    return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const result = await runCS_Report(slug as CS_ReportSlug, body);
    const mime =
      result.kind === "zip"
        ? "application/zip"
        : result.mime;
    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error al generar reporte",
      },
      { status: 500 },
    );
  }
}
