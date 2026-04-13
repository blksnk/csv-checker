import type { FC, ReactNode } from "react";
import type { ThemeName } from "tamagui";
import type { IconProps } from "@tamagui/helpers-icon";

/** Bordered info panel with optional icon and title. */
export type CalloutProps = {
  icon?: FC<IconProps>;
  title?: ReactNode;
  children: ReactNode;
  theme?: ThemeName;
};
