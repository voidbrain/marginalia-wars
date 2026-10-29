// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularEslint from 'angular-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '.angular/**', 'playwright-report/**', 'test-results/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...angularEslint.configs.tsRecommended,
  {
    files: ['**/*.ts'],
    rules: {
      // Component/class conventions for this codebase.
      '@angular-eslint/component-class-suffix': [
        'error',
        { suffixes: ['Page', 'Store', 'Service', ''] },
      ],
      // OnPush and standalone are the defaults in Angular v22: AGENTS.md says not to set them explicitly.
      '@angular-eslint/prefer-inject': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },
  {
    // Strong logic/UI separation: the domain layer must stay framework-free.
    files: ['src/app/domain/**/*.ts', 'src/app/data/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@angular/core', message: 'The domain layer must not import Angular.' },
            { name: '@angular/router', message: 'The domain layer must not import Angular.' },
          ],
          patterns: [
            { group: ['@angular/*'], message: 'The domain layer must not import Angular.' },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angularEslint.configs.templateRecommended],
    rules: {},
  },
  prettierConfig,
);
