import type { ValidationError, ValidationErrorType } from "@/stores/validation";
import { lineBreaker } from "@/utils/string.utils";
import type { Observable } from "@legendapp/state";
import { Memo } from "@legendapp/state/react";
import { AlertTriangle } from "@tamagui/lucide-icons-2";
import { Paragraph, XStack } from "tamagui";

type ErrorHintProps = {
  item$: Observable<ValidationError<ValidationErrorType>>;
};

export function EditorErrorHint({ item$: error$ }: ErrorHintProps) {
  return (
    <XStack
      theme="error_surface1"
      p="$2"
      items="center"
      gap="$2"
      bg="$background"
      rounded="$1"
    >
      <AlertTriangle size="$1" />
      <Paragraph>
        <Memo>{() => lineBreaker(error$.message.get())}</Memo>
      </Paragraph>
    </XStack>
  );
}
