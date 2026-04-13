import { defaultConfig } from "@tamagui/config/v5";
import { createTamagui } from "tamagui";
import { createV5Theme, defaultChildrenThemes } from "@tamagui/config/v5";
import { v5ComponentThemes } from "@tamagui/themes/v5";
import {
  yellow,
  yellowDark,
  red,
  redDark,
  green,
  greenDark,
} from "@tamagui/colors";
import { createAnimations } from "@tamagui/animations-motion";

const darkPalette = [
  "hsla(0, 15%, 1%, 1)",
  "hsla(0, 15%, 6%, 1)",
  "hsla(0, 15%, 12%, 1)",
  "hsla(0, 15%, 17%, 1)",
  "hsla(0, 15%, 23%, 1)",
  "hsla(0, 15%, 28%, 1)",
  "hsla(0, 15%, 34%, 1)",
  "hsla(0, 15%, 39%, 1)",
  "hsla(0, 15%, 45%, 1)",
  "hsla(0, 15%, 50%, 1)",
  "hsla(0, 15%, 93%, 1)",
  "hsla(0, 15%, 99%, 1)",
];
const lightPalette = [
  "hsla(0, 15%, 99%, 1)",
  "hsla(0, 15%, 94%, 1)",
  "hsla(0, 15%, 88%, 1)",
  "hsla(0, 15%, 83%, 1)",
  "hsla(0, 15%, 77%, 1)",
  "hsla(0, 15%, 72%, 1)",
  "hsla(0, 15%, 66%, 1)",
  "hsla(0, 15%, 61%, 1)",
  "hsla(0, 15%, 55%, 1)",
  "hsla(0, 15%, 50%, 1)",
  "hsla(0, 15%, 15%, 1)",
  "hsla(0, 15%, 1%, 1)",
];

// Your custom accent color theme
const accentLight = {
  accent1: "hsla(250, 50%, 40%, 1)",
  accent2: "hsla(250, 50%, 43%, 1)",
  accent3: "hsla(250, 50%, 46%, 1)",
  accent4: "hsla(250, 50%, 48%, 1)",
  accent5: "hsla(250, 50%, 51%, 1)",
  accent6: "hsla(250, 50%, 54%, 1)",
  accent7: "hsla(250, 50%, 57%, 1)",
  accent8: "hsla(250, 50%, 59%, 1)",
  accent9: "hsla(250, 50%, 62%, 1)",
  accent10: "hsla(250, 50%, 65%, 1)",
  accent11: "hsla(250, 50%, 95%, 1)",
  accent12: "hsla(250, 50%, 95%, 1)",
};

const accentDark = {
  accent1: "hsla(250, 50%, 35%, 1)",
  accent2: "hsla(250, 50%, 38%, 1)",
  accent3: "hsla(250, 50%, 41%, 1)",
  accent4: "hsla(250, 50%, 43%, 1)",
  accent5: "hsla(250, 50%, 46%, 1)",
  accent6: "hsla(250, 50%, 49%, 1)",
  accent7: "hsla(250, 50%, 52%, 1)",
  accent8: "hsla(250, 50%, 54%, 1)",
  accent9: "hsla(250, 50%, 57%, 1)",
  accent10: "hsla(250, 50%, 60%, 1)",
  accent11: "hsla(250, 50%, 90%, 1)",
  accent12: "hsla(250, 50%, 95%, 1)",
};

const builtThemes = createV5Theme({
  darkPalette,
  lightPalette,
  componentThemes: v5ComponentThemes,
  accent: {
    light: accentLight,
    dark: accentDark,
  },
  childrenThemes: {
    // Include default color themes (blue, red, green, yellow, etc.)
    ...defaultChildrenThemes,

    // Semantic color themes for warnings, errors, and success states
    warning: {
      light: yellow,
      dark: yellowDark,
    },
    error: {
      light: red,
      dark: redDark,
    },
    success: {
      light: green,
      dark: greenDark,
    },
  },
});

/** Tamagui theme map produced by `createV5Theme` (light/dark and semantic children). */
export type Themes = typeof builtThemes;

// the process.env conditional here is optional but saves web client-side bundle
// size by leaving out themes JS. tamagui automatically hydrates themes from CSS
// back into JS for you, and the bundler plugins set TAMAGUI_ENVIRONMENT. so
// long as you are using the Vite, Next, Webpack plugins this should just work,
// but if not you can just export builtThemes directly as themes:
/** Resolved theme tokens; empty on client production builds when CSS hydrates themes. */
export const themes: Themes =
  process.env.TAMAGUI_ENVIRONMENT === "client" &&
  process.env.NODE_ENV === "production"
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({} as any)
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (builtThemes as any);

const animations = createAnimations({
  "300ms": { duration: 300 },
  "150ms": { duration: 150 },
  bouncy: {
    type: "spring",
    damping: 9,
    mass: 0.9,
    stiffness: 150,
  },
  quick: {
    type: "spring",
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
});

/** Root Tamagui config: default v5 config plus themes and motion animations. */
export const config = createTamagui({
  ...defaultConfig,
  themes,
  animations,
  settings: {
    onlyAllowShorthands: false,
  },
});

type TamaguiConf = typeof config;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends TamaguiConf {}
}
