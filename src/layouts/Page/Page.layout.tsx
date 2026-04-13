import { View, YStack, type TamaguiElement } from "tamagui";
import type { PageLayoutProps } from "./Page.types";
import { Header } from "../../components";
import { type Nullable } from "@ubloimmo/front-util";
import { useRef, type ReactNode } from "react";

/**
 * Standard page: header, scrollable body, optional custom child with `containerRef`.
 *
 * @param {PageLayoutProps} props - Header, padding, and children / `ChildComponent`
 * @return {JSX.Element} Full-page stack
 */
export function PageLayout({
  children,
  ChildComponent,
  padding,
  noPadding,
  ...headerProps
}: PageLayoutProps) {
  const containerRef = useRef<Nullable<TamaguiElement & HTMLElement>>(null);

  const child: ReactNode = ChildComponent ? (
    <ChildComponent containerRef={containerRef} />
  ) : (
    children
  );

  return (
    <YStack flex={1} position="absolute" inset={0}>
      <Header {...headerProps} />
      <View
        p={padding ?? (noPadding ? 0 : "$4")}
        pt={0}
        flex={1}
        ref={containerRef}
        overflow="scroll"
      >
        {child}
      </View>
    </YStack>
  );
}
