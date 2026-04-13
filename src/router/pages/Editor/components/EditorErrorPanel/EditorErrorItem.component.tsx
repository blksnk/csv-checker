import type { ValidationCellPath } from "@/stores/validation";
import { For } from "@legendapp/state/react";
import { useMemo } from "react";
import { Button, H6, XStack, YStack } from "tamagui";
import { EditorErrorHint } from "./EditorErrorHint.component";
import { STORES } from "@/stores";
import { ArrowUpRight } from "@tamagui/lucide-icons-2";
import { Tooltip } from "@/components";

/** One error group for a single {@link ValidationCellPath}. */
type EditorErrorItemProps = {
  path: ValidationCellPath;
};

/**
 * Renders all errors for one failing cell: messages and jump-to-row control.
 *
 * @param {EditorErrorItemProps} props - Cell path string
 * @return {JSX.Element} Error item
 */
export function EditorErrorItem({ path }: EditorErrorItemProps) {
  const [rowIndexStr, columnName] = useMemo(() => path.split(";"), [path]);

  const rowIndex = useMemo(() => parseInt(rowIndexStr), [rowIndexStr]);

  const scrollToCell = () => {
    const tableRef = STORES.editor.tableRef.current.peek();
    if (!tableRef?.scrollToIndex) return;
    if (isNaN(rowIndex)) return;

    tableRef.scrollToIndex(rowIndex);
  };

  return (
    <YStack mb="$4" p="$4" rounded="$4" gap="$4" theme="error" bg="$background">
      <XStack justify="space-between" items="center">
        <H6>
          Column {columnName}, Row {rowIndex + 1}
        </H6>
        <Tooltip content="Jump to the problematic row.">
          <Button iconAfter={ArrowUpRight} size="$2" onClick={scrollToCell}>
            Fix
          </Button>
        </Tooltip>
      </XStack>

      {/* @ts-expect-error support for generic derived observable seems a bit hit and miss*/}
      <For each={STORES.validation.errorMap[path]} item={EditorErrorHint} />
    </YStack>
  );
}
