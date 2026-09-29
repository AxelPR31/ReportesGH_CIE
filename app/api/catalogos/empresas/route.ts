import { NextResponse } from "next/server";
import { listCS_Empresas } from "@/lib/catalogos/cs_empresas";
import { isCS_SqlConfigured } from "@/lib/config/cs_env";

export async function GET() {
  if (!isCS_SqlConfigured()) {
    return NextResponse.json({ empresas: [] });
  }
  try {
    const empresas = await listCS_Empresas();
    return NextResponse.json({ empresas });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo cargar empresas",
      },
      { status: 500 },
    );
  }
}
