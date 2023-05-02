module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    "jest/globals": true,
  },
  extends: ["standard", "prettier"],
  plugins: ["jest"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "no-unused-vars": "warn",
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
  },
};
