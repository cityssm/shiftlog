import eslintCspell from '@cspell/eslint-plugin'
import configWebApp, {
  defineConfig
} from 'eslint-config-cityssm'
import { cspellWords } from 'eslint-config-cityssm/exports'
import eslintPluginNoUnsanitized from 'eslint-plugin-no-unsanitized'

const escapedMethods = ['cityssm.escapeHTML']

export const config = defineConfig(configWebApp, {
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      projectService: true
    }
  },
  plugins: {
    '@cspell': eslintCspell,

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    'no-unsanitized': eslintPluginNoUnsanitized
  },
  rules: {
    '@cspell/spellchecker': [
      'warn',
      {
        cspell: {
          words: [
            ...cspellWords,

            // App
            'noopener',
            'noreferrer',
            'onhidden',
            'javascripts',
            'radiusless',
            'rowspan',
            'shiftlog',

            // SQL
            'datediff',

            // Shift Log
            'maint',
            'timesheet',
            'timesheets',

            // Pearl
            'worktech'
          ]
        }
      }
    ],
    '@typescript-eslint/no-unsafe-type-assertion': 'off',

    'no-unsanitized/method': [
      'error',
      {
        escape: {
          methods: escapedMethods
        }
      }
    ],

    'no-unsanitized/property': [
      'error',
      {
        escape: {
          methods: escapedMethods
        }
      }
    ]
  }
})

export default config
