import {
  batch,
  isNumber,
  observable,
  ObservableHint,
  type Observable,
} from "@legendapp/state";
import type { CellPath, EditorStore } from "./editor.types";
import { csv$ } from "../csv";
import type { CsvCellValue } from "../csv/csv.types";
import { isNull } from "@ubloimmo/front-util";
import { validation$ } from "../validation";

// maximum number of entries
const EDITOR_HISTORY_SIZE = 100;
const EDITOR_HISTORY_CUTOFF_SIZE = EDITOR_HISTORY_SIZE - 1;

export const editor$: Observable<EditorStore> = observable<EditorStore>({
  focusedCellPath: null,
  showErrorPanel: false,
  unfocus: () => editor$.focusedCellPath.set(null),
  tableRef: ObservableHint.opaque({ current: null }),
  focusCell: (path) => {
    editor$.focusedCellPath.set(path);
  },
  _setCellValue: (path: CellPath, value: CsvCellValue) => {
    csv$.rows[path.rowIndex][path.columnName].set(value);
    // TODO: maybe only validate changed cells or only run a subset of validation rules (required, type) on change
    validation$.validate();
  },
  editCell: (path$, value) => {
    const path = path$.get();
    const previousValue = csv$.rows[path.rowIndex][path.columnName].peek();

    // abort if no change in value;
    if (value === previousValue) return;

    const timestamp = Date.now();

    // in the case where this is the first edit, we store the initial pre-edit value as the first entry
    // in order to allow undoing the first change
    batch(() => {
      if (!editor$.history.entries.get().size) {
        editor$.history.append({
          path,
          value: previousValue,
          timestamp: 0,
        });
      }
      editor$.history.append({
        path,
        value,
        timestamp,
      });
    });

    // only after storing entries do we actually mutate the cell's value
    editor$._setCellValue(path, value);
  },
  history: {
    entries: ObservableHint.plain(new Map()),
    currentEntryId: null,
    append: (newEntry) => {
      // remove any entries exceeding max size - 1, oldest first
      // in practice, most of the time, only 1 entry is deleted at a time
      const entries = editor$.history.entries.get();
      const toRemoveCount = Math.max(
        0,
        entries.size - EDITOR_HISTORY_CUTOFF_SIZE,
      );
      if (entries.size < 0) {
        // map entries are iterated in insertion order, perfect for this usecase
        let i = 0;
        for (const [timestamp] of entries) {
          entries.delete(timestamp);
          i++;
          if (i >= toRemoveCount) break;
        }
      }
      // remove future entries if currently in a future state
      const previousTimestamp = editor$.history.currentEntryId.peek();
      if (isNumber(previousTimestamp)) {
        for (const [timestamp] of entries) {
          if (timestamp <= previousTimestamp) continue;
          entries.delete(timestamp);
        }
      }
      // append new entry & update entry ids
      batch(() => {
        entries.set(newEntry.timestamp, newEntry);
        editor$.history.currentEntryId.set(newEntry.timestamp);
      });
    },
    undo: () => {
      const currentTimestamp = editor$.history.currentEntryId.peek();
      if (isNull(currentTimestamp)) return;
      const timestamps = Array.from(editor$.history.entries.get().keys());
      const currentIndex = timestamps.indexOf(currentTimestamp);
      // -1: not found, 0: no previous entry to apply
      if (currentIndex <= 0) return;
      const previousTimestamp = timestamps[currentIndex - 1];
      const previousEntry = editor$.history.entries
        .get()
        .get(previousTimestamp);
      if (!previousEntry) return;

      batch(() => {
        editor$.history.currentEntryId.set(previousEntry.timestamp);
        editor$._setCellValue(previousEntry.path, previousEntry.value);
      });
    },
    redo: () => {
      const currentTimestamp = editor$.history.currentEntryId.peek();
      if (isNull(currentTimestamp)) return;
      const timestamps = Array.from(editor$.history.entries.get().keys());
      const currentIndex = timestamps.indexOf(currentTimestamp);
      // -1: not found, > size - 2: no next entry to apply
      if (currentIndex < 0 || currentIndex > timestamps.length - 2) return;
      const nextTimestamp = timestamps[currentIndex + 1];
      const nextEntry = editor$.history.entries.get().get(nextTimestamp);
      if (!nextEntry) return;

      batch(() => {
        editor$.history.currentEntryId.set(nextEntry.timestamp);
        editor$._setCellValue(nextEntry.path, nextEntry.value);
      });
    },
    clear: () => {
      batch(() => {
        editor$.history.currentEntryId.set(null);
        editor$.history.entries.get().clear();
      });
    },
  },
});
