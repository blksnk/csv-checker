import type { BadgeProps } from "./Badge.types";
import { Paragraph, XStack } from "tamagui";

export function Badge({ children, theme, icon: Icon, onClick }: BadgeProps) {
  return (
    <XStack
      theme={theme}
      onClick={onClick}
      cursor={onClick ? "pointer" : "default"}
      backgroundColor="$background"
      rounded="$11"
      borderWidth={1}
      borderColor="$borderColor"
      px="$2"
      py="$0.5"
      transition="quick"
    >
      {Icon && <Icon />}
      <Paragraph fontWeight={500} fontSize="$2" color="$colorFocus">
        {children}
      </Paragraph>
    </XStack>
  );
}
