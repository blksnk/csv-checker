import type { Nullable, RequireAtLeastOne } from "@ubloimmo/front-util";
import type { FC, ReactNode, RefObject } from "react";

export type LayoutComponentChildProps = {
  containerRef: RefObject<Nullable<HTMLElement>>;
};

export type LayoutComponentChild = FC<LayoutComponentChildProps>;

export type LayoutProps = RequireAtLeastOne<{
  children?: ReactNode;
  ChildComponent?: LayoutComponentChild;
}>;
