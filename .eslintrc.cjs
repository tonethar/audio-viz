/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  ignorePatterns: ["*.js"],
  rules: {
    "no-console": 1,
    "object-shorthand": 1,
    "quotes": 1,
    "no-plusplus": 1,
    "eqeqeq" : 1,
    "semi" : 1,
    "max-len" : 1,
    "quote-props" : [1,"as-needed"],
    "no-debugger" : 1,
    "no-unreachable": 1,
    "indent": ["warn", 2],
    "space-before-blocks": 1,
    "keyword-spacing": 1,
    "eol-last": 1,
    "space-infix-ops": 1,
    "object-curly-spacing": [1,"always"],
    "id-length": 1,
    "no-new-wrappers": 1,
    "no-duplicate-imports": 1
  }
};