import type { HeaderProps } from "../../components";
import type { LayoutProps } from "../Layout.types";

/** {@link LayoutProps} plus {@link HeaderProps} and scroll padding options. */
export type PageLayoutProps = LayoutProps &
  HeaderProps & {
    noPadding?: boolean;
    padding?: string;
  };
