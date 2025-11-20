import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.applicationName = 'Accessibility Reporting'
config.application.backgroundImage = 'background-accessibility.jpg'

config.shifts = {
  isEnabled: false
}

config.workOrders = {
  isEnabled: true,
  router: 'accessibilityReports',
  
  sectionName: 'Accessibility Reports',
  sectionNameSingular: 'Accessibility Report',

  iconClass: 'fa-wheelchair'
}

config.timesheets = {
  isEnabled: false
}

export default config
