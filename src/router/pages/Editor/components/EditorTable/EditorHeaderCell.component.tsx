import { SCHEMA_COLUMN_TYPE_OPTION_COPY } from "@/router/pages/SchemaConfigurator/SchemaConfigurator.constants";
import { STORES } from "@/stores";
import type { SchemaColumnName } from "@/stores/schema";
import type { Observable } from "@legendapp/state";
import { Memo, useObservable } from "@legendapp/state/react";
import { H6, Paragraph, XStack } from "tamagui";

type EditorHeaderCellProps = {
  item$: Observable<SchemaColumnName>;
};

export function EditorHeaderCell({
  item$: columnName$,
}: EditorHeaderCellProps) {
  const isFocused$ = useObservable(() => {
    return STORES.editor.focusedCellPath.columnName.get() === columnName$.get();
  });
  return (
    <th>
      <XStack
        minW="15rem"
        backgroundColor="$background"
        p="$2"
        justify="space-between"
      >
        <Memo>
          {() => (
            <H6
              textAlign="left"
              color={isFocused$.get() ? "$accentColor" : "$color"}
            >
              {columnName$.get()}
            </H6>
          )}
        </Memo>
        <Paragraph>
          <Memo>
            {() =>
              SCHEMA_COLUMN_TYPE_OPTION_COPY[
                STORES.schema.columns[columnName$.get()].type.get()
              ].label
            }
          </Memo>
        </Paragraph>
      </XStack>
    </th>
  );
}
