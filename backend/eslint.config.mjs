// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';


export default defineConfig(
  {
    // Ignora os arquivos de build e dist
    ignores: ['**/build/**', '**/dist/**', 'src/some/file/to/ignore.ts'],
  },
  // Aplica as regras recomendadas do ESLint
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off', // desativa a regra JS nativa
      '@typescript-eslint/no-unused-vars': [
        'error',
        // Ignora as variáveis que começam com _
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-floating-promises': 'error'
    }
  },
  {
    // Desabilita a verificação de tipos em arquivos JavaScript
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    // Desabilita a verificação de promessas não tratadas em arquivos de teste
    files: ['test/**/*.ts', 'test/**/*.js'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    }
  }

);