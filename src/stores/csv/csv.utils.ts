import { parseCsvFile } from "@/utils/csv.utils";
import type { CsvRow, CsvRowData } from "./csv.types";

export async function parseCsvFileData(file: File): Promise<CsvRow[]> {
  const parseResults = await parseCsvFile(file, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
    worker: true,
  });

  if (!parseResults.data?.length) return [];

  return (parseResults.data as CsvRowData[]).map(
    (row, index): CsvRow => ({ ...row, __row_id__: String(index) }),
  );
}
