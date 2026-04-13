import {
  configureSynced,
  syncObservable,
  type SyncTransform,
} from "@legendapp/state/sync";
import { observablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb";
import { objectValues } from "@ubloimmo/front-util";
import type { ObservableParam } from "@legendapp/state";

const INDEXED_DB_NAME = "CSV";
// version needs to be incremented whenever tables have been added / updated
const INDEXED_DB_VERSION = 5;

export const INDEXED_DB_TABLES = Object.freeze({
  SCHEMA_COLUMNS: "SCHEMA_COLUMNS",
  CSV_ROWS: "CSV_ROWS",
  CSV_FILENAME: "CSV_FILENAME",
});

const INDEXED_DB_TABLE_NAMES = objectValues(INDEXED_DB_TABLES);

export const persistIndexedDB = configureSynced({
  persist: {
    plugin: observablePersistIndexedDB({
      databaseName: INDEXED_DB_NAME,
      version: INDEXED_DB_VERSION,
      tableNames: INDEXED_DB_TABLE_NAMES,
    }),
  },
});

type PersistObservableOptions<T, TSaved = T> = {
  transform?: SyncTransform<T, TSaved>;
  debounceMs?: number;
  syncMode?: "auto" | "manual";
};

export function persistObservable<T, TSaved = T>(
  observable: ObservableParam<T>,
  tableName: string,
  { transform, debounceMs, syncMode }: PersistObservableOptions<T, TSaved> = {},
) {
  return syncObservable(
    observable,
    persistIndexedDB({
      persist: {
        name: tableName,
        transform,
      },
      debounceSet: debounceMs,
      syncMode,
    }),
  );
}
