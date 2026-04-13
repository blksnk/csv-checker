import type { Nullable, RequireAtLeastOne } from "@ubloimmo/front-util";
import type { FC, ReactNode, RefObject } from "react";

/** Passed to layout child components that need the scroll container ref. */
export type LayoutComponentChildProps = {
  containerRef: RefObject<Nullable<HTMLElement>>;
};

/** Child render function type for layouts that delegate content to a component. */
export type LayoutComponentChild = FC<LayoutComponentChildProps>;

/**
 * Page shell: either `children` or a `ChildComponent` receiving the container ref.
 */
export type LayoutProps = RequireAtLeastOne<{
  children?: ReactNode;
  ChildComponent?: LayoutComponentChild;
}>;
