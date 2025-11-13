import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './partialConfig.js'

export const config: Config = { ...baseConfig }

config.session.doKeepAlive = true

config.shifts = {
  isEnabled: true,
  sectionName: 'SHifts',
  sectionNameSingular: 'Shift'
}

config.workOrders = {
  isEnabled: false
}

config.timesheets = {
  isEnabled: true,
  sectionName: 'TiMesheets',
  sectionNameSingular: 'Timesheet'
}

export default config
