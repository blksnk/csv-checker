import type { VoidFn } from "@ubloimmo/front-util";
import type { FC, ReactNode } from "react";
import type { ThemeName } from "tamagui";

/** Small pill-style label with optional icon and click handler. */
export type BadgeProps = {
  children: ReactNode;
  icon?: FC;
  theme?: ThemeName;
  onClick?: VoidFn;
};
