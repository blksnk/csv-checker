import type { RouteObject } from "react-router";
import { objectValues } from "@ubloimmo/front-util";

import { Importer } from "./Importer";
import { SchemaConfigurator } from "./SchemaConfigurator";
import { Editor } from "./Editor";
import { Home } from "./Home";

/** Route module objects keyed by page name (each exports `path`, `displayName`, element). */
export const PAGES = { Home, Importer, SchemaConfigurator, Editor };

/** Flat list of `RouteObject`s passed to `createBrowserRouter`. */
export const PAGE_ROUTES: RouteObject[] = objectValues(PAGES);
