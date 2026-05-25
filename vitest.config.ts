import { resolve } from "node:path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    root: "./",
  },
  plugins: [swc.vite({ module: { type: "es6" } })],
  oxc: false,
  resolve: {
    alias: {
      "@domain": resolve(__dirname, "./src/domain"),
      "@infra": resolve(__dirname, "./src/infra"),
      "@application": resolve(__dirname, "./src/application"),
      "@presentation": resolve(__dirname, "./src/presentation"),
    },
  },
});
