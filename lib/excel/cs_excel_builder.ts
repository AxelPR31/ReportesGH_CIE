import ExcelJS from "exceljs";

export type CS_SheetData = {
  name: string;
  headers: string[];
  rows: (string | number | Date | null)[][];
  headerArgb?: string;
};

export async function buildCS_WorkbookBuffer(
  sheets: CS_SheetData[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  for (const sheet of sheets) {
    const ws = workbook.addWorksheet(sheet.name);
    ws.addRow(sheet.headers);
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: sheet.headerArgb ?? "FF1E3A8A" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    for (const row of sheet.rows) {
      ws.addRow(row);
    }
    ws.columns.forEach((col) => {
      col.width = 18;
    });
  }
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export async function buildCS_SingleSheetBuffer(
  sheet: CS_SheetData,
): Promise<Buffer> {
  return buildCS_WorkbookBuffer([sheet]);
}

export function rowsFromRecordset(
  recordset: Record<string, unknown>[],
): { headers: string[]; rows: (string | number | Date | null)[][] } {
  if (recordset.length === 0) {
    return { headers: [], rows: [] };
  }
  const headers = Object.keys(recordset[0]);
  const rows = recordset.map((row) =>
    headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return null;
      if (v instanceof Date) return v;
      if (typeof v === "object") return String(v);
      return v as string | number;
    }),
  );
  return { headers, rows };
}
