module.exports = {
  extends: [
    "eslint:recommended",
    "standard-with-typescript",
    "plugin:jsx-a11y/recommended",
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "@electron-toolkit/eslint-config-ts/recommended",
    "@electron-toolkit/eslint-config-prettier"
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '.json', ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', "prettier", "react","jsx-a11y","react-hooks","@typescript-eslint"],
  rules: {
    "prettier/prettier": "error"
  }
};

// module.exports = {
//   env: {
//     browser: true,
//     es2021: true,
//   },
//   extends: [
//     'eslint:recommended',
//     'plugin:react/recommended',
//     'plugin:@typescript-eslint/recommended',
//     'plugin:prettier/recommended',
//   ],
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     ecmaVersion: 2020,
//     sourceType: 'module',
//     ecmaFeatures: {
//       jsx: true,
//     },
//   },
//   plugins: ['react', '@typescript-eslint', 'prettier'],
//   rules: {
//     'prettier/prettier': 'error',
//   },
// };
