import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.applicationName = 'ShiftLog'
config.application.backgroundImage = 'background.jpg'
config.application.instance = 'publicWorks'

config.session.doKeepAlive = true

config.shifts = {
  isEnabled: true,
  sectionName: 'Shifts',
  sectionNameSingular: 'Shift'
}

config.timesheets = {
  isEnabled: true,
  sectionName: 'Timesheets',
  sectionNameSingular: 'Timesheet'
}

export default config
