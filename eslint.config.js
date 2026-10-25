import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/App.tsx'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          // 공유 패키지는 src/theme 같은 얇은 파일을 거쳐 쓴다(공통 지침 #25).
          { group: ['@smartinfolab/app-core/*'], message: '공유 패키지는 src/theme·src/platform 파일을 거쳐 쓰세요.' },
        ],
      }],
    },
  },
])
