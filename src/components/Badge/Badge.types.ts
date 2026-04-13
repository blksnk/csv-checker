import type { VoidFn } from "@ubloimmo/front-util";
import type { FC, ReactNode } from "react";
import type { ThemeName } from "tamagui";

export type BadgeProps = {
  children: ReactNode;
  icon?: FC;
  theme?: ThemeName;
  onClick?: VoidFn;
};
