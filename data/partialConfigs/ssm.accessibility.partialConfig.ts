// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @cspell/spellchecker */

import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './accessibility.partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.attachmentStoragePath = 'data/attachments/accessibility'

config.reverseProxy = {
  trafficIsForwarded: true,
  urlPrefix: '/accessibility'
}

config.locations = {
  syncSource: 'arcgis',

  layerURL:
    'https://enterprise.ssmic.com/server/rest/services/SooMaps/SooMaps_GeneralLayers/MapServer/0',

  whereClause: "MUNICIPALITY = 'SSM'",

  mappings: {
    address1: (record: {
      CIVICNUMBER: number
      STREETNAME: string
    }): string | undefined => `${record.CIVICNUMBER} ${record.STREETNAME}`,

    cityProvince: (): string => 'Sault Ste. Marie, ON',

    latitude: 'LATITUDE',
    longitude: 'LONGITUDE'
  }
}

export default config
