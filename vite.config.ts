import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { tamaguiPlugin } from "@tamagui/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  define: {
    DEV: `${process.env.NODE_ENV === "development"}`,
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
    tsconfigPaths: true,
  },
  optimizeDeps: {},
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tamaguiPlugin({
      config: "src/config/tamagui.config.ts",
    }),
  ].filter(Boolean),
});
