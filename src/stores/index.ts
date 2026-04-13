import { csv$, csvRowsSyncState$ } from "./csv";
import { editor$ } from "./editor";
import { schema$, schemaColumnsSyncState$ } from "./schema";
import { validation$ } from "./validation";

export const STORES = Object.freeze({
  schema: schema$,
  schemaColumnsSync: schemaColumnsSyncState$,
  csv: csv$,
  csvRowsSync: csvRowsSyncState$,
  editor: editor$,
  validation: validation$,
});
