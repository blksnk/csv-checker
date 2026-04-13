import { For } from "@legendapp/state/react";
import { STORES } from "@/stores";
import { EditorHeaderCell } from "./EditorHeaderCell.component";
import styles from "./EditorTable.module.css";
import { H6 } from "tamagui";

export function EditorHeader() {
  return (
    <tr>
      <th className={styles.indexCell}>
        <H6 textAlign="center">#</H6>
      </th>
      <For each={STORES.schema.columnNames} item={EditorHeaderCell} />
    </tr>
  );
}
