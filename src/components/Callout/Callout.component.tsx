import { H6, Paragraph, XStack, YStack } from "tamagui";
import type { CalloutProps } from "./Callout.types";

export function Callout({ children, title, icon: Icon, theme }: CalloutProps) {
  return (
    <YStack
      width="100%"
      theme={theme}
      rounded="$4"
      p="$4"
      gap="$2"
      bg="$background"
      border="1px solid $borderColor"
    >
      {(title || Icon) && (
        <XStack gap="$4">
          {Icon && <Icon size="$2" />}
          <H6>{title}</H6>
        </XStack>
      )}
      <Paragraph size="$3">{children}</Paragraph>
    </YStack>
  );
}
