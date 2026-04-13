import type { ValidationCellPath } from "@/stores/validation";
import { For, useObservable } from "@legendapp/state/react";
import { useMemo } from "react";
import { Button, H6, XStack, YStack } from "tamagui";
import { EditorErrorHint } from "./EditorErrorHint.component";
import { STORES } from "@/stores";
import { ArrowUpRight } from "@tamagui/lucide-icons-2";
import { Tooltip } from "@/components";

type EditorErrorItemProps = {
  path: ValidationCellPath;
};

export function EditorErrorItem({ path }: EditorErrorItemProps) {
  const cellErrors$ = useObservable(() =>
    STORES.validation.errorMap[path].get(),
  );
  const [rowIndex, columnName] = useMemo(() => path.split(";"), [path]);

  const scrollToCell = () => {
    const tableRef = STORES.editor.tableRef.current.peek();
    if (!tableRef?.scrollToIndex) return;
    const index = parseInt(rowIndex);
    if (isNaN(index)) return;

    tableRef.scrollToIndex(index);
  };

  return (
    <YStack mb="$4" p="$4" rounded="$4" gap="$4" theme="error" bg="$background">
      <XStack justify="space-between" items="center">
        <H6>
          Column {columnName}, Row {rowIndex}
        </H6>
        <Tooltip content="Jump to the problematic row.">
          <Button iconAfter={ArrowUpRight} size="$2" onClick={scrollToCell}>
            Fix
          </Button>
        </Tooltip>
      </XStack>

      {/* @ts-expect-error support for generic derived observable seems a bit hit and miss*/}
      <For each={cellErrors$} item={EditorErrorHint} />
    </YStack>
  );
}
