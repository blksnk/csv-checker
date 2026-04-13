import {
  batch,
  observable,
  ObservableHint,
  type Observable,
} from "@legendapp/state";
import type {
  SchemaColumnConstraints,
  SchemaColumnName,
  SchemaColumnType,
  SchemaStore,
} from "./schema.types";
import { schemaColumnsFromCsvFile } from "./schema.utils";
import { objectKeys, objectValues, type VoidFn } from "@ubloimmo/front-util";
import { INDEXED_DB_TABLES, persistObservable } from "@/utils/store.utils";
import { validation$ } from "../validation";

export const schema$: Observable<SchemaStore> = observable<SchemaStore>({
  columns: ObservableHint.plain({}),
  columnsArray: () => objectValues(schema$.columns.get()),
  columnNames: () =>
    objectValues(schema$.columns.get({ shallow: true }))
      .sort((a, b) => a.index - b.index)
      .map(({ name }) => name),
  loaded: false,
  configured: (): boolean =>
    objectValues(schema$.columns.get()).every(({ configured }) => configured),
  outdated: false,
  initializeFromCsvFile: async (file: File) => {
    const columns = await schemaColumnsFromCsvFile(file);
    batch(() => {
      schema$.columns.set(columns);
      schema$.loaded.set(true);
      validation$.invalidate();
    });
  },
  configureColumnType: (name: SchemaColumnName, type: SchemaColumnType) => {
    if (!(name in schema$.columns.peek())) return;
    batch(() => {
      schema$.columns[name].assign({ type, configured: true });
      validation$.invalidate();
    });
  },
  configureColumnConstraints: (
    name: SchemaColumnName,
    constraintChangeFn: VoidFn<[Observable<SchemaColumnConstraints>]>,
  ) => {
    if (!(name in schema$.columns.peek())) return;
    batch(() => {
      constraintChangeFn(schema$.columns[name].constraints);
      schema$.columns[name].configured.set(true);
      validation$.invalidate();
    });
  },
  refreshFromCsvFile: async (file: File) => {
    // no need to diff new columns if none are loaded
    if (!schema$.columnsArray.peek().length) {
      await schema$.initializeFromCsvFile(file);
      return;
    }
    // parse columns from file and diff to get added columns
    const columns = await schemaColumnsFromCsvFile(file);
    const previousColumns = schema$.columns.peek();

    const newColumnNames = new Set(objectKeys(columns));
    const previousColumnNames = new Set(objectKeys(previousColumns));

    const mergedColumnNames = new Set([
      ...newColumnNames,
      ...previousColumnNames,
    ]);

    batch(() => {
      for (const columnName of mergedColumnNames) {
        // add new columns
        if (!previousColumnNames.has(columnName)) {
          schema$.columns[columnName].set(columns[columnName]);
          continue;
        }
        //remove deleted columns
        if (!newColumnNames.has(columnName)) {
          schema$.columns[columnName].delete();
          continue;
        }
        // base case: update existing column indices & preview data
        const { index, previewData } = columns[columnName];
        schema$.columns[columnName].assign({
          index,
          previewData,
        });
      }
      schema$.loaded.set(true);
      validation$.invalidate();
    });
  },
});

export const schemaColumnsSyncState$ = persistObservable(
  schema$.columns,
  INDEXED_DB_TABLES.SCHEMA_COLUMNS,
);
