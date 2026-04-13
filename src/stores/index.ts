import { csv$, csvRowsSyncState$ } from "./csv";
import { editor$ } from "./editor";
import { schema$, schemaColumnsSyncState$ } from "./schema";
import { validation$ } from "./validation";

/** Map of canonical store observables (and IndexedDB sync handles) for debugging or tooling. */
export const STORES = Object.freeze({
  schema: schema$,
  schemaColumnsSync: schemaColumnsSyncState$,
  csv: csv$,
  csvRowsSync: csvRowsSyncState$,
  editor: editor$,
  validation: validation$,
});
