import { TableVirtuoso, type TableVirtuosoHandle } from "react-virtuoso";
import { EditorRow } from "./EditorRow.component";
import { useUnmountOnce, useValue, useWhen } from "@legendapp/state/react";
import { Spinner } from "tamagui";
import { STORES } from "@/stores";
import { EditorHeader } from "./EditorHeader.component";
import styles from "./EditorTable.module.css";

const OVERSCAN_PX = 300;

export function EditorTable() {
  const csvRows = useValue(STORES.csv.rows, { shallow: true });

  const loaded = useWhen(STORES.csvRowsSync.isLoaded);

  const saveTableRef = (tableRef: TableVirtuosoHandle) => {
    STORES.editor.tableRef.set({ current: tableRef });
  };

  useUnmountOnce(() => {
    STORES.editor.tableRef.set({ current: null });
  });

  if (!loaded) {
    return <Spinner />;
  }

  return (
    <TableVirtuoso
      ref={saveTableRef}
      className={styles.editorTable}
      style={{ height: "100%", overflowX: "auto", flexGrow: 2 }}
      data={csvRows}
      fixedHeaderContent={EditorHeader}
      itemContent={EditorRow}
      overscan={OVERSCAN_PX}
    />
  );
}
