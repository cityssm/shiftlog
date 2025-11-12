import type { Config } from '../../types/config.types.js'

export const config: Config = {
  application: {},
  reverseProxy: {},
  session: {},

  connectors: {
    shiftLog: {
      server: 'localhost'
    }
  }
}

export default config
