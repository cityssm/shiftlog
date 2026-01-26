/* eslint-disable no-secrets/no-secrets */
import eslintCspell from '@cspell/eslint-plugin';
import configWebApp, { defineConfig } from 'eslint-config-cityssm';
import { cspellWords } from 'eslint-config-cityssm/exports';
import eslintPluginNoUnsanitized from 'eslint-plugin-no-unsanitized';
const escapedMethods = [
    'cityssm.dateToString',
    'cityssm.escapeHTML',
    'exports.shiftLog.buildShiftURL',
    'exports.shiftLog.buildWorkOrderURL',
    'exports.shiftLog.buildTimesheetURL'
];
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
                        'hellip',
                        'noopener',
                        'noreferrer',
                        'onhidden',
                        'javascripts',
                        'radiusless',
                        'rowspan',
                        // SQL
                        'datediff',
                        // Shift Log
                        'maint',
                        'shiftlog',
                        'timesheet',
                        'timesheets',
                        // Avanti
                        'avanti',
                        // Pearl
                        'worktech',
                        // ArcGIS
                        'arcgis',
                        'ntfy'
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
        ],
        "unicorn/no-null": "off"
    }
});
export default config;
