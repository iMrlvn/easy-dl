import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/lib.ts"],
  format: ["cjs", "esm"],
  outDir: "dist",
  dts: true,
  minify: true,
  clean: true,
});