import type {
  AsyncFn,
  GenericFn,
  Nullable,
  Nullish,
  VoidFn,
} from "@ubloimmo/front-util";
import type { SchemaColumnName } from "../schema";

/** Single cell value in the CSV grid (`null` / `undefined` mean empty). */
export type CsvCellValue = Nullish<string>;

/** One row’s values keyed by schema column name (no row id). */
export type CsvRowData = Record<SchemaColumnName, CsvCellValue>;

/** Parsed CSV row: {@link CsvRowData} plus a stable `__row_id__` for keys and virtualization. */
export type CsvRow = CsvRowData & {
  __row_id__: string;
};

/**
 * Legend-State shape for CSV file loading, rows, and export.
 */
export type CsvStore = {
  rows: CsvRow[];
  file: {
    name: Nullable<string>;
  };
  rows_keyExtractor: GenericFn<[CsvRow], string>;
  loading: boolean;
  loaded: boolean;
  loadFromFile: AsyncFn<[File], void>;
  download: VoidFn;
};
