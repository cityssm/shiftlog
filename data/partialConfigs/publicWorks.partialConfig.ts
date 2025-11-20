import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.applicationName = 'Public Works Shift Log'
config.application.backgroundImage = 'background.jpg'

config.session.doKeepAlive = true

config.shifts = {
  isEnabled: true,
  sectionName: 'SHifts',
  sectionNameSingular: 'SHift'
}

config.workOrders = {
  isEnabled: false
}

config.timesheets = {
  isEnabled: true,
  sectionName: 'TiMesheets',
  sectionNameSingular: 'TiMesheet'
}

export default config
