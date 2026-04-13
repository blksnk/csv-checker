import { observable, type Observable } from "@legendapp/state";
import type { CsvRow, CsvStore } from "./csv.types";
import { schema$ } from "../schema";
import { parseCsvFileData } from "./csv.utils";
import { INDEXED_DB_TABLES, persistObservable } from "@/utils/store.utils";
import { downloadCsvFile } from "@/utils/csv.utils";

export const csv$: Observable<CsvStore> = observable<CsvStore>({
  file: {
    name: null,
  },
  rows: [],
  rows_keyExtractor: (row: CsvRow) => row.__row_id__,
  loading: false,
  loaded: () => csv$.rows.get().length > 0,
  loadFromFile: async (file: File) => {
    // first set the rows
    csv$.loading.set(true);
    csv$.file.name.set(file.name);
    const rows = await parseCsvFileData(file);
    csv$.rows.set(rows);
    csv$.loading.set(false);

    // then update the schema
    schema$.refreshFromCsvFile(file);
  },
  download: () => {
    downloadCsvFile(
      csv$.rows.peek(),
      schema$.columns.peek(),
      csv$.file.name.peek() ?? "data.csv",
    );
  },
});

export const csvRowsSyncState$ = persistObservable<
  CsvRow[],
  Record<number, CsvRow>
>(csv$.rows, INDEXED_DB_TABLES.CSV_ROWS, {
  transform: {
    save: (rows) => {
      return rows;
    },
    load: (record) => {
      const rows: CsvRow[] = [];
      for (const indexStr in record) {
        rows[parseInt(indexStr)] = record[indexStr];
      }
      return rows;
    },
  },
});

persistObservable(csv$.file, INDEXED_DB_TABLES.CSV_FILENAME);
