import { For, Memo } from "@legendapp/state/react";
import { EditorCell } from "./EditorCell.component";
import { STORES } from "@/stores";
import styles from "./EditorTable.module.css";
import { Paragraph } from "tamagui";

/**
 * One data row: index cell plus a cell per schema column.
 *
 * @param {number} rowIndex - Zero-based row index in `STORES.csv.rows`
 * @return {JSX.Element} Table row fragment
 */
export function EditorRow(rowIndex: number) {
  return (
    <>
      <td className={styles.indexCell}>
        <Memo>
          {() => {
            const isFocused =
              STORES.editor.focusedCellPath.rowIndex.get() === rowIndex;
            return (
              <Paragraph color={isFocused ? "$accent1" : undefined}>
                {rowIndex + 1}
              </Paragraph>
            );
          }}
        </Memo>
      </td>
      <For
        each={STORES.schema.columnNames}
        itemProps={{ rowIndex }}
        item={EditorCell}
      />
    </>
  );
}
