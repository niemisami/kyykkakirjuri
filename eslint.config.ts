import stylistic from '@stylistic/eslint-plugin'
import { tanstackConfig } from '@tanstack/eslint-config'
import { defineConfig } from 'eslint/config'

const config = defineConfig([
  stylistic.configs['recommended'],
  tanstackConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
      },
    },
  },
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
    },
  },
  {
    rules: {
      'no-shadow': 'off',
      '@stylistic/keyword-spacing': ['error', {
        after: false,
        overrides: {
          // Keep space after keywords that need it
          const: { after: true },
          else: { after: true },
          return: { after: true },
          throw: { after: true },
          case: { after: true },
          export: { after: true },
          import: { after: true },
          from: { after: true },
          default: { after: true },
          type: { after: true },
          try: { after: true },
          catch: { after: false },
          finally: { after: true },
          as: { after: true },
          of: { after: true },
        },
      }],
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/jsx-child-element-spacing': 'error',
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/operator-linebreak': ['error', 'after', { overrides: { '|': 'before', '?': 'before', ':': 'before' } }],
      '@stylistic/no-trailing-spaces': ['error'],
      '@stylistic/space-infix-ops': ['error'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/type-annotation-spacing': 'error',
      '@stylistic/no-multi-spaces': ['error'],
      '@stylistic/no-multiple-empty-lines': ['error', {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      }],
      '@stylistic/comma-dangle': [
        'warn',
        {
          arrays: 'always-multiline',
          enums: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'never',
          functions: 'never',
          generics: 'never',
          tuples: 'never',
        },
      ],
      '@stylistic/indent': ['error', 2, {
        ignoredNodes: ['TemplateLiteral *'],
        SwitchCase: 1,
      }],
      '@stylistic/jsx-indent-props': ['error', 2],
      '@stylistic/jsx-quotes': ['error', 'prefer-single'],
      '@stylistic/jsx-closing-tag-location': ['error', 'tag-aligned'],
      '@stylistic/jsx-closing-bracket-location': ['error', 'tag-aligned'],
      '@stylistic/jsx-self-closing-comp': 'error',
      '@stylistic/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
      '@stylistic/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      '@stylistic/jsx-max-props-per-line': ['error', {
        maximum: { multi: 1, single: 4 },
      }],
      '@stylistic/jsx-tag-spacing': ['error', {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never',
      }],
      '@stylistic/jsx-wrap-multilines': ['error', {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'parens-new-line',
      }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
    },
  },
])

export default config
