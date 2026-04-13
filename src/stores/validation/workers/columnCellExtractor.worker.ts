import type { CsvRow } from "@/stores/csv/csv.types";
import type { SchemaColumnName } from "@/stores/schema";

type ColumnCellExtractorPayload = {
  columnName: SchemaColumnName;
  csvRows: CsvRow[];
};

export function extractColumnCells({
  columnName,
  csvRows,
}: ColumnCellExtractorPayload) {
  const columnCells = [];
  for (const row of csvRows) {
    columnCells.push(row[columnName]);
  }

  return columnCells;
}
