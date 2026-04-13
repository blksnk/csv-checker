import type { ParseResult } from "papaparse";
import { parse, unparse } from "papaparse";
import type { CsvRow } from "@/stores/csv/csv.types";
import type {
  SchemaColumnName,
  SchemaColumnRecord,
} from "@/stores/schema/schema.types";
import { downloadStringAsFile } from "./file.utils";

/**
 * Returns schema column names sorted by their configured `index`.
 *
 * @param {SchemaColumnRecord} columns - Schema columns keyed by name
 * @return {SchemaColumnName[]} Ordered column names
 */
function orderedSchemaColumnNames(
  columns: SchemaColumnRecord,
): SchemaColumnName[] {
  return Object.values(columns)
    .sort((a, b) => a.index - b.index)
    .map(({ name }) => name);
}

/**
 * Serializes in-memory rows to CSV using schema column order; `__row_id__` is not written.
 *
 * @param {CsvRow[]} rows - Parsed CSV rows
 * @param {SchemaColumnRecord} columns - Schema defining column order
 * @return {string} CSV string with header row
 */
export function csvRowsToCsvString(
  rows: CsvRow[],
  columns: SchemaColumnRecord,
): string {
  const columnNames = orderedSchemaColumnNames(columns);
  const data = rows.map((row) => {
    const record: Record<string, string> = {};
    for (const name of columnNames) {
      const cell = row[name];
      record[name] = cell ?? "";
    }
    return record;
  });
  return unparse(data, { columns: columnNames, header: true });
}

/**
 * Builds CSV from rows and triggers a browser download.
 *
 * @param {CsvRow[]} rows - Parsed CSV rows
 * @param {SchemaColumnRecord} columns - Schema defining column order
 * @param {string} filename - Download filename
 * @return {void}
 */
export function downloadCsvFile(
  rows: CsvRow[],
  columns: SchemaColumnRecord,
  filename: string,
): void {
  const csvString = csvRowsToCsvString(rows, columns);
  downloadStringAsFile(csvString, filename, "text/csv;charset=utf-8");
}

/**
 * Arguments accepted by {@link parseCsvFile}, matching Papa Parse’s `parse` for `File` sources without `complete`.
 *
 * @template TResult - Parsed row shape
 */
type ParseCsvFnParams<TResult> =
  Parameters<typeof parse<TResult>> extends [infer TSource, infer TConfig]
    ? TSource extends File
      ? [TSource, Omit<TConfig, "complete">]
      : never
    : never;

/**
 * Parses a CSV `File` with Papa Parse and returns a promise for the {@link ParseResult}.
 *
 * @template TResult - Parsed row record type
 * @param {...ParseCsvFnParams<TResult>} args - File and parse config (without `complete` / `error`)
 * @return {Promise<ParseResult<TResult>>} Resolves with Papa Parse result
 */
export function parseCsvFile<TResult>(
  ...args: ParseCsvFnParams<TResult>
): Promise<ParseResult<TResult>> {
  return new Promise<ParseResult<TResult>>((resolve, reject) => {
    parse(args[0], {
      ...args[1],
      complete: resolve,
      error: reject,
    });
  });
}
