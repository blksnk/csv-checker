import type { HeaderProps } from "../../components";
import type { LayoutProps } from "../Layout.types";

export type PageLayoutProps = LayoutProps &
  HeaderProps & {
    noPadding?: boolean;
    padding?: string;
  };
