/** @type {import('eslint'.Linter.Config)} */
module.exports = {
  // Used for React libraries and others JS libraries
  extends: ['@rocketseat/eslint-config/react'],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error',
  },
}
