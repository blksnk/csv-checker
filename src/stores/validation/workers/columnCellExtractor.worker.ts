import type { CsvRow } from "@/stores/csv/csv.types";
import type { SchemaColumnName } from "@/stores/schema";

/** Input for {@link extractColumnCells}. */
type ColumnCellExtractorPayload = {
  columnName: SchemaColumnName;
  csvRows: CsvRow[];
};

/**
 * Collects one column’s cell values across all rows (order matches row index).
 *
 * @param {ColumnCellExtractorPayload} payload - Column name and full row set
 * @return Row-ordered cell values for the requested column
 */
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
