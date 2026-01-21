const js = require("@eslint/js");
const globals = require("globals");
const reactPlugin = require("eslint-plugin-react");
const securityPlugin = require("eslint-plugin-security");
const babelParser = require("@babel/eslint-parser");

module.exports = [
  js.configs.recommended,
  securityPlugin.configs.recommended,
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
      "security/detect-buffer-noassert": 1,
      "security/detect-child-process": 1,
      "security/detect-disable-mustache-escape": 1,
      "security/detect-eval-with-expression": 1,
      "security/detect-new-buffer": 1,
      "security/detect-no-csrf-before-method-override": 1,
      "security/detect-non-literal-fs-filename": 1,
      "security/detect-non-literal-regexp": 1,
      "security/detect-non-literal-require": 0,
      "security/detect-object-injection": 0,
      "security/detect-possible-timing-attacks": 1,
      "security/detect-pseudoRandomBytes": 1,
      "security/detect-unsafe-regex": 1,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
