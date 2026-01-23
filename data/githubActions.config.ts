/* eslint-disable @cspell/spellchecker, sonarjs/no-hardcoded-passwords -- Config file */

import type { Config } from '../types/config.types.js'

import { config as baseConfig } from './partialConfigs/all.partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.instance = ''

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
}

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
}

export default config
