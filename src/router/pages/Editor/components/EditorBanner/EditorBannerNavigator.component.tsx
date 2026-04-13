import { STORES } from "@/stores";
import { Memo } from "@legendapp/state/react";
import { ArrowUpRight } from "@tamagui/lucide-icons-2";
import { isNumber, type Optional } from "@ubloimmo/front-util";
import { useState } from "react";
import { Button, Form, Group, Input } from "tamagui";
import { Tooltip } from "@/components";

/**
 * Numeric row input that scrolls the virtualized table to a 1-based row number.
 *
 * @return {JSX.Element} Mini form with submit
 */
export function EditorBannerNavigator() {
  const [rowNumber, setRowNumber] = useState<Optional<number>>(undefined);

  const navigateOnSubmit = () => {
    const tableRef = STORES.editor.tableRef.current.peek();
    if (!tableRef?.scrollToIndex) return;
    if (!isNumber(rowNumber)) return;
    // perform navigation
    const rowIndex = Math.max(rowNumber - 1, 0);
    tableRef.scrollToIndex(rowIndex);
    // should we clear for reuse ?
  };

  const onChange = (text: string) => {
    const number = parseInt(text);
    if (isNaN(number)) return;
    setRowNumber(number);
  };

  return (
    <Form onSubmit={navigateOnSubmit}>
      <Group
        theme="light"
        orientation="horizontal"
        rounded="$2"
        overflow="hidden"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Memo>
          {() => (
            <Tooltip content="Type in a row number to instantly jump to it.">
              <Input
                size="$2"
                rounded="0"
                required
                placeholder="Row number"
                value={rowNumber}
                onChangeText={onChange}
                bg="white"
                borderWidth={0}
                type="number"
                minW="7rem"
                step={1}
                min={1}
                max={STORES.csv.rows.length}
              />
            </Tooltip>
          )}
        </Memo>
        <Form.Trigger>
          <Button
            iconAfter={ArrowUpRight}
            rounded="0"
            size="$2"
            borderWidth={0}
            borderLeftWidth={1}
          >
            Go to row
          </Button>
        </Form.Trigger>
      </Group>
    </Form>
  );
}
