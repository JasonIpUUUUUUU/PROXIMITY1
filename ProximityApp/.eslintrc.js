module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // Disable all formatting rules
    'no-trailing-spaces': 'off',
    'comma-dangle': 'off',
    semi: 'off',
    quotes: 'off',
    indent: 'off',
    'no-multi-spaces': 'off',
    'key-spacing': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'comma-spacing': 'off',
    'space-infix-ops': 'off',
    'space-before-blocks': 'off',
    'keyword-spacing': 'off',
    'arrow-spacing': 'off',
    'no-whitespace-before-property': 'off',
    'space-in-parens': 'off',
    'block-spacing': 'off',
    'func-call-spacing': 'off',
    'no-multiple-empty-lines': 'off',
    'eol-last': 'off',
    'react/no-unescaped-entities': 'off',

    // Relax important rules to warnings
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-undef': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    jest: true,
    node: true,
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'coverage/'],
};
