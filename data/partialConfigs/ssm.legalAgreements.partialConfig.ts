import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './legalAgreements.partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.attachmentStoragePath = 'data/attachments/legalAgreements'

config.reverseProxy = {
  trafficIsForwarded: true,
  urlPrefix: '/legalAgreements'
}

export default config
