const js = require("@eslint/js");
const globals = require("globals");
const reactPlugin = require("eslint-plugin-react");
const babelParser = require("@babel/eslint-parser");

module.exports = [
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      "no-console": "off",
      
      indent: ["error", 4],
      "linebreak-style": ["error", "unix"],
      "no-unused-vars": [
          "error",
          {
              vars: "all",
              args: "none",
          },
      ],
      quotes: ["error", "single"],
      semi: ["error", "always"],
      "space-before-function-paren": ["error", "never"],
      "space-in-parens": ["error", "never"],
      "no-trailing-spaces": ["error"],
      "key-spacing": [
          "error",
          {
              beforeColon: false,
          },
      ],
      "func-call-spacing": ["error", "never"],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
