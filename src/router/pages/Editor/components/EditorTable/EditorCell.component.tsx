import { STORES } from "@/stores";
import type { CellPath } from "@/stores/editor";
import type { SchemaColumnName } from "@/stores/schema";
import type { Observable } from "@legendapp/state";
import {
  Memo,
  useObservable,
  Show,
  usePauseProvider,
} from "@legendapp/state/react";
import { Paragraph, Theme, View } from "tamagui";
import { EditorCellInput } from "./EditorCellInput.component";
import { useVisibilityChange } from "@/hooks";
import { useRef } from "react";
import styles from "./EditorTable.module.css";
import type { ValidationCellPath } from "@/stores/validation";
import { objectKeys } from "@ubloimmo/front-util";

type EditorCellProps = {
  item$: Observable<SchemaColumnName>;
  id?: string;
  rowIndex: number;
};

export function EditorCell(props: EditorCellProps) {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const { PauseProvider, isPaused$ } = usePauseProvider();

  const pauseObservablesWhenHidden = (visible: boolean) => {
    isPaused$.set(!visible);
  };
  const path$ = useObservable<CellPath>(() => ({
    rowIndex: props.rowIndex,
    columnName: props.item$.get(),
  }));

  const hasError$ = useObservable(() => {
    const { rowIndex, columnName } = path$.get();
    const pathStr: ValidationCellPath = `${rowIndex};${columnName}`;
    const cellErrors = STORES.validation.errorMap[pathStr].get();
    return !!cellErrors && !!objectKeys(cellErrors).length;
  });

  useVisibilityChange(cellRef, pauseObservablesWhenHidden);

  return (
    <Memo>
      {() => (
        <td ref={cellRef} data-state={hasError$.get() ? "invalid" : "valid"}>
          <Theme passThrough name={hasError$.get() ? "error" : "light"}>
            <PauseProvider>
              <EditorCellContent {...props} path$={path$} />
            </PauseProvider>
          </Theme>
        </td>
      )}
    </Memo>
  );
}

type EditorCellContentProps = EditorCellProps & {
  path$: Observable<CellPath>;
};

function EditorCellContent({
  item$: columnName$,
  rowIndex,
  path$,
}: EditorCellContentProps) {
  const value$ = useObservable(
    () => STORES.csv.rows[rowIndex][columnName$.get()],
  );

  // TODO: pause compute if cell is not visible
  const isFocused$ = useObservable(() => {
    const focused = STORES.editor.focusedCellPath.get();
    if (!focused) return false;
    const current = path$.get();
    return (
      focused.rowIndex === current.rowIndex &&
      focused.columnName === current.columnName
    );
  });

  const focus = () => {
    STORES.editor.focusCell(path$.get());
  };

  return (
    <View onClick={focus} flex={1} minH="100%">
      <Show
        if={isFocused$}
        else={() => (
          <Paragraph
            className={styles.editorCellDisplay}
            wordWrap="normal"
            style={{ wordBreak: "break-word" }}
          >
            <Memo>{value$}</Memo>
          </Paragraph>
        )}
      >
        {() => <EditorCellInput path$={path$} />}
      </Show>
    </View>
  );
}
