/* eslint-disable no-secrets/no-secrets */

import configWebApp, { defineConfig } from 'eslint-config-cityssm'

const escapedMethods = [
  'cityssm.dateToString',
  'cityssm.escapeHTML',
  'DOMPurify.sanitize',
  'exports.shiftLog.buildShiftURL',
  'exports.shiftLog.buildWorkOrderURL',
  'exports.shiftLog.buildTimesheetURL'
]

export const config = defineConfig(configWebApp, {
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      projectService: true
    }
  },
  rules: {
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
    ],

    'require-unicode-regexp': 'off',

    'unicorn/no-null': 'off'
  }
})

export default config
