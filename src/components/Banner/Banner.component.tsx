import { Footer, XStack } from "tamagui";
import type { BannerProps } from "./Banner.types";

export function Banner({ children }: BannerProps) {
  return (
    <Footer
      position="absolute"
      left={0}
      right={0}
      bottom={0}
      zIndex={2}
      borderTopWidth={1}
      px="$4"
      py="$2"
      borderTopColor="$borderColor"
      backgroundColor="$background"
    >
      <XStack items="center" justify="space-between">
        {children}
      </XStack>
    </Footer>
  );
}
