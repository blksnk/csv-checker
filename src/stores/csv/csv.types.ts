import type {
  AsyncFn,
  GenericFn,
  Nullable,
  Nullish,
  VoidFn,
} from "@ubloimmo/front-util";
import type { SchemaColumnName } from "../schema";

export type CsvCellValue = Nullish<string>;

export type CsvRowData = Record<SchemaColumnName, CsvCellValue>;

export type CsvRow = CsvRowData & {
  __row_id__: string;
};

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
