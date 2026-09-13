import eslint from '@eslint/js';
import {defineConfig, globalIgnores} from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    globalIgnores([
        'build/',
        'dist/',
        'docs/',
    ]),
    {
        rules: {
            "no-unused-vars": ["off"],
            "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_"}],
        }
    }
);
