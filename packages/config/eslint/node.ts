import tseslint from "typescript-eslint";
import nodePlugin from "eslint-plugin-n";
import baseConfig from "./base";

export default tseslint.config(
  ...baseConfig,
  nodePlugin.configs["flat/recommended-module"],
  {
    rules: {
      "n/no-process-exit": "error",
      "n/prefer-global/process": ["error", "never"],
      "n/no-missing-import": "off",
    },
  },
  {
    files: ["**/express.d.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
);
