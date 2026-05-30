import { defineConfig, type UserConfig } from "tsdown";

export function tsdownPreset(overrides: UserConfig = {}): UserConfig {
  return defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    outDir: "dist",
    platform: "neutral",
    ...overrides,
  });
}

export default tsdownPreset();
