import { H3, Paragraph, YStack } from "tamagui";
import { isNonEmptyString } from "../../utils/string.utils";
import type { HeaderProps } from "./Header.types";
import { Header as HeaderElement } from "tamagui";
import { Nav } from "../Nav";

export function Header({ title = "Header", subTitle }: HeaderProps) {
  return (
    <HeaderElement
      width="100%"
      px="$4"
      py="$2"
      display="flex"
      flexDirection="row"
      gap="$1"
      justify="space-between"
      items="center"
      backgroundColor="$background"
      borderBottomColor="$borderColor"
      borderBottomWidth={1}
    >
      <YStack gap="$1" items="baseline">
        <H3 fontWeight="600">{title}</H3>
        {isNonEmptyString(subTitle) && (
          <Paragraph fontWeight="normal">{subTitle}</Paragraph>
        )}
      </YStack>
      <Nav />
    </HeaderElement>
  );
}
