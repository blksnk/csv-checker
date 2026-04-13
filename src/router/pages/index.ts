import type { RouteObject } from "react-router";
import { objectValues } from "@ubloimmo/front-util";

import { Importer } from "./Importer";
import { SchemaConfigurator } from "./SchemaConfigurator";
import { Editor } from "./Editor";
import { Home } from "./Home";

export const PAGES = { Home, Importer, SchemaConfigurator, Editor };

export const PAGE_ROUTES: RouteObject[] = objectValues(PAGES);
