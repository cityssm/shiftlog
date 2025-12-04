import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.applicationName = 'Legal Agreements'
config.application.backgroundImage = 'background-legalAgreements.jpg'
config.application.instance = 'legalAgreements'

config.workOrders = {
  isEnabled: true,

  router: 'agreements',

  sectionName: 'Agreements',
  sectionNameSingular: 'Agreement',

  iconClass: 'fa-file-contract'
}

export default config
