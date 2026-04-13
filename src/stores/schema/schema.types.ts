import type { Observable } from "@legendapp/state";
import type { AsyncFn, Enum, Optional, VoidFn } from "@ubloimmo/front-util";

/** Supported logical types for imported CSV columns. */
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

/** One of {@link SCHEMA_COLUMN_TYPES}. */
export type SchemaColumnType = Enum<typeof SCHEMA_COLUMN_TYPES>;

/** Column header string as used in CSV and as map key in the schema. */
export type SchemaColumnName = string;

/**
 * Optional link to another column for conditional required rules (`requiredIf*`).
 */
export type SchemaColumnRelationConstraint =
  | {
      active: false;
      columnName?: Optional<SchemaColumnName>;
    }
  | { active: true; columnName: SchemaColumnName };

/** Validation rules attached to a single column. */
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

/** Metadata for one column: type, sample preview values, constraints, and UI state. */
export type SchemaColumn = {
  name: SchemaColumnName;
  type: SchemaColumnType;
  previewData: unknown[];
  constraints: SchemaColumnConstraints;
  index: number;
  configured: boolean;
};

/** All columns keyed by {@link SchemaColumnName}. */
export type SchemaColumnRecord = Record<SchemaColumnName, SchemaColumn>;

/** Top-level schema container (columns only). */
export type Schema = {
  columns: SchemaColumnRecord;
};

/** Partial updates when configuring a column from the UI. */
export type SchemaColumnConfig = {
  type?: SchemaColumnType;
  constraints?: SchemaColumnConstraints;
};

/**
 * Observable store: inferred columns, configuration, and CSV sync helpers.
 */
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
