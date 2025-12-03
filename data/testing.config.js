// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @cspell/spellchecker, sonarjs/no-hardcoded-passwords */
import { config as baseConfig } from './partialConfigs/publicWorks.partialConfig.js';
export const config = { ...baseConfig };
config.application.instance = '';
config.login = {
    authentication: {
        type: 'plainText',
        config: {
            users: {
                'domain\\~administrator': '~administrator',
                'domain\\~testinquiry': '~testinquiry',
                'domain\\~testuser': '~testuser'
            }
        }
    },
    domain: 'domain'
};
config.connectors = {
    shiftLog: {
        server: 'localhost',
        user: 'sa',
        password: 'dbatools.I0',
        database: 'ShiftLog',
        options: {
            encrypt: false
        }
    }
};
export default config;
