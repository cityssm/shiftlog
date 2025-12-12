import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.instance = 'all'

config.session.doKeepAlive = true

config.shifts = {
  isEnabled: true
}

config.workOrders = {
  isEnabled: true
}

config.timesheets = {
  isEnabled: true
}

export default config
