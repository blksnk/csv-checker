import type { FC, ReactNode } from "react";
import type { ThemeName } from "tamagui";
import type { IconProps } from "@tamagui/helpers-icon";

export type CalloutProps = {
  icon?: FC<IconProps>;
  title?: ReactNode;
  children: ReactNode;
  theme?: ThemeName;
};
