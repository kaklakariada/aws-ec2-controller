// @ts-check

import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    languageOptions: { globals: globals.browser }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig, {
    // plugins: {},
    rules: {
      // Not required any more for React > 17
      'react/react-in-jsx-scope': 'off',
      "react/no-unknown-property": ["error", { "ignore": ["css"] }],
    }
  }
];
