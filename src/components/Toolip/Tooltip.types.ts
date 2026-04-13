import type { ReactNode } from "react";
import type { TooltipProps as TProps } from "tamagui";

/** Thin wrapper around Tamagui tooltip with paragraph content. */
export type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  placement?: TProps["placement"];
};
