import type { Observable } from "@legendapp/state";
import type { AsyncFn, Enum, Optional, VoidFn } from "@ubloimmo/front-util";

export const SCHEMA_COLUMN_TYPES = [
  "string",
  "int",
  "float",
  "boolean",
  "date",
  "email",
  "phone",
  "url",
  "currency",
  "currency_sign",
  "id",
  "uuid",
] as const;

export type SchemaColumnType = Enum<typeof SCHEMA_COLUMN_TYPES>;

export type SchemaColumnName = string;

export type SchemaColumnRelationConstraint =
  | {
      active: false;
      columnName?: Optional<SchemaColumnName>;
    }
  | { active: true; columnName: SchemaColumnName };

export type SchemaColumnConstraints = {
  /**
   * All rows in this column should have unique values
   */
  unique?: boolean;
  /**
   * All rows in this column should be filled out
   */
  required?: boolean;
  /**
   * Rows in this column should be required if another column in the same row is filled
   */
  requiredIfFilled?: SchemaColumnRelationConstraint;
  /**
   * Rows in this column should be required if another column in the same row is empty
   */
  requiredIfNotFilled?: SchemaColumnRelationConstraint;
};

export type SchemaColumn = {
  name: SchemaColumnName;
  type: SchemaColumnType;
  previewData: unknown[];
  constraints: SchemaColumnConstraints;
  index: number;
  configured: boolean;
};

export type SchemaColumnRecord = Record<SchemaColumnName, SchemaColumn>;

export type Schema = {
  columns: SchemaColumnRecord;
};

export type SchemaColumnConfig = {
  type?: SchemaColumnType;
  constraints?: SchemaColumnConstraints;
};

export type SchemaStore = {
  columns: SchemaColumnRecord;
  columnsArray: SchemaColumn[];
  columnNames: SchemaColumnName[];
  loaded: boolean;
  outdated: boolean;
  configured: boolean;
  initializeFromCsvFile: AsyncFn<[File]>;
  refreshFromCsvFile: AsyncFn<[File]>;
  configureColumnType: VoidFn<[SchemaColumnName, type: SchemaColumnType]>;
  configureColumnConstraints: VoidFn<
    [
      SchemaColumnName,
      constraintChangeFn: VoidFn<[Observable<SchemaColumnConstraints>]>,
    ]
  >;
};
