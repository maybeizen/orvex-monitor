import playwright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

import reactConfig from "@orvex/config/eslint/react";

export default tseslint.config(...reactConfig, {
  files: ["tests/e2e/**"],
  ...playwright.configs["flat/recommended"],
});
