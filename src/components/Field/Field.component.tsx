import { useId } from "react";
import { Label, YStack } from "tamagui";
import type { FieldProps } from "./Field.types";
import { HelpCircle } from "@tamagui/lucide-icons-2";
import { Tooltip } from "../Toolip";

export function Field({ Input, label, tooltip }: FieldProps) {
  const id = useId();

  const input = <Input id={id} />;

  if (tooltip)
    return (
      <YStack flex={1} minW={225}>
        <Tooltip content={tooltip}>
          <Label
            htmlFor={id}
            width="fit-content"
            cursor="help"
            display="flex"
            flexDirection="row"
            gap="$1"
            items="center"
          >
            {label} <HelpCircle size="$1" />
          </Label>
        </Tooltip>
        {input}
      </YStack>
    );

  return (
    <YStack flex={1}>
      <Label htmlFor={id} width="fit-content">
        {label}
      </Label>
      {input}
    </YStack>
  );
}
