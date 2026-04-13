import type { Nullable, VoidFn } from "@ubloimmo/front-util";
import type { SchemaColumnName } from "../schema";
import type { CsvCellValue } from "../csv/csv.types";
import type { Observable } from "@legendapp/state";
import type { TableVirtuosoHandle } from "react-virtuoso";

export type CellPath = {
  rowIndex: number;
  columnName: SchemaColumnName;
};

export type EditorHistoryEntry = {
  path: CellPath;
  value: CsvCellValue;
  timestamp: number;
};

export type EditorHistory = {
  entries: Map<number, EditorHistoryEntry>;
  currentEntryId: Nullable<number>;
  /**
   * Rolls back edit state by 1 history entry
   */
  undo: VoidFn;
  /**
   * Rolls forward edit state by 1 history entry
   */
  redo: VoidFn;
  /**
   * Appends a new history entry following an edit
   *
   * In the case where a new edit has been made after an undo,
   * discards any entries after the branch point
   */
  append: VoidFn<[entry: EditorHistoryEntry]>;
  /**
   * Cleas the history entries
   */
  clear: VoidFn;
};

export interface EditorStore {
  focusedCellPath: Nullable<CellPath>;
  tableRef: {
    current: Nullable<TableVirtuosoHandle>;
  };
  focusCell: VoidFn<[path: Nullable<CellPath>]>;
  _setCellValue: VoidFn<[path: CellPath, value: CsvCellValue]>;
  editCell: VoidFn<[path: Observable<CellPath>, value: CsvCellValue]>;
  unfocus: VoidFn;
  history: EditorHistory;
  showErrorPanel: boolean;
}
