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

/** IndexedDB table name constants used for Legend-State persistence. */
export const INDEXED_DB_TABLES = Object.freeze({
  SCHEMA_COLUMNS: "SCHEMA_COLUMNS",
  CSV_ROWS: "CSV_ROWS",
  CSV_FILENAME: "CSV_FILENAME",
});

const INDEXED_DB_TABLE_NAMES = objectValues(INDEXED_DB_TABLES);

/**
 * Pre-configured Legend-State sync preset that persists observables to IndexedDB.
 *
 * @return {ReturnType<typeof configureSynced>} Sync configuration with IndexedDB plugin
 */
export const persistIndexedDB = configureSynced({
  persist: {
    plugin: observablePersistIndexedDB({
      databaseName: INDEXED_DB_NAME,
      version: INDEXED_DB_VERSION,
      tableNames: INDEXED_DB_TABLE_NAMES,
    }),
  },
});

/**
 * Options for {@link persistObservable}.
 *
 * @template T - In-memory observable value type
 * @template TSaved - Serialized shape when different from `T`
 */
type PersistObservableOptions<T, TSaved = T> = {
  transform?: SyncTransform<T, TSaved>;
  debounceMs?: number;
  syncMode?: "auto" | "manual";
};

/**
 * Wraps an observable with IndexedDB persistence using {@link persistIndexedDB}.
 *
 * @template T - In-memory observable value type
 * @template TSaved - Serialized type when using `transform`
 * @param {import("@legendapp/state").ObservableParam<T>} observable - Observable to persist
 * @param {string} tableName - IndexedDB table name (see {@link INDEXED_DB_TABLES})
 * @param {PersistObservableOptions<T, TSaved>} [options] - Debounce, sync mode, and optional save/load transform
 * @return {ReturnType<typeof syncObservable>} Synced observable binding
 */
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
