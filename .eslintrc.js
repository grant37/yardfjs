module.exports = {
  extends: ['@nighttrax/eslint-config-tsx', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      },
    ],
    quotes: ['error', 'single'],
    'class-methods-use-this': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
  },
};
