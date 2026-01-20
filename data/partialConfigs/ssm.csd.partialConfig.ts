import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './csd.partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.attachmentStoragePath = 'data/attachments/csd'

config.reverseProxy = {
  trafficIsForwarded: true,
  urlPrefix: '/csd'
}

config.locations = {
  syncSource: 'arcgis',

  layerURL:
    'https://services1.arcgis.com/nlLTq2Zj0Jwv1qft/ArcGIS/rest/services/playground_analysis/FeatureServer/0',

  whereClause: "Municipality = 'Sault Ste. Marie' AND Owner = 'City'",

  mappings: {
    address1: 'Name',
    address2: 'Address',

    cityProvince: (): string => 'Sault Ste. Marie, ON'
  }
}


export default config
