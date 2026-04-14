import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.applicationName = 'IT Helpdesk'
config.application.backgroundImage = 'background-phone.jpg'
config.application.instance = 'itHelpdesk'

config.workOrders = {
  isEnabled: true,

  router: 'tickets',

  sectionName: 'Tickets',
  sectionNameSingular: 'Ticket',

  iconClass: 'fa-circle-exclamation'
}

export default config
