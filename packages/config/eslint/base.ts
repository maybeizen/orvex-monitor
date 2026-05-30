import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importX from "eslint-plugin-import-x";
import unicorn from "eslint-plugin-unicorn";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    plugins: { unicorn },
    rules: {
      "unicorn/prefer-module": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/no-array-for-each": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-logical-operator-over-ternary": "error",
      "unicorn/no-useless-undefined": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "import-x/no-cycle": "error",
      "import-x/no-duplicates": "error",
      "import-x/no-unresolved": "off",
    },
  },
  prettier,
);
