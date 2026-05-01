import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './itHelpdesk.partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.attachmentStoragePath = 'data/attachments/itHelpdesk'

config.reverseProxy = {
  trafficIsForwarded: true,
  urlPrefix: '/itHelpdesk'
}

config.workOrders = {
  ...config.workOrders,
  hasCosts: false
}

export default config
