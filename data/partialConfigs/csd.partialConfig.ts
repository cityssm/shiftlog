import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.applicationName = 'Community Services Requests'
config.application.backgroundImage = 'background-playground.jpg'
config.application.instance = 'csd'

config.shifts = {
  isEnabled: false
}

config.workOrders = {
  isEnabled: true,
  router: 'requests',
  
  sectionName: 'Service Requests',
  sectionNameSingular: 'Service Request',

  iconClass: 'fa-clipboard-check'
}

config.timesheets = {
  isEnabled: false
}

export default config
