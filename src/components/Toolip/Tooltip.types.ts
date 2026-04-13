import type { ReactNode } from "react";
import type { TooltipProps as TProps } from "tamagui";

export type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  placement?: TProps["placement"];
};
