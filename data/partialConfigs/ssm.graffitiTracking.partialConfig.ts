/* eslint-disable @cspell/spellchecker -- GIS column names */

import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './graffitiTracking.partialConfig.js'

export const config: Config = { ...baseConfig }

config.application.attachmentStoragePath = 'data/attachments/graffiti'

config.reverseProxy = {
  trafficIsForwarded: true,
  urlPrefix: '/graffiti'
}

config.locations = {
  syncSource: 'arcgis',

  layerURL:
    'https://enterprise.ssmic.com/server/rest/services/SooMaps/SooMaps_GeneralLayers/MapServer/0',

  whereClause: "MUNICIPALITY = 'SSM'",

  mappings: {
    address1: (record: unknown): string | undefined => {
      const typedRecord = record as {
        CIVICNUMBER: number
        STREETNAME: string
      }
      return `${typedRecord.CIVICNUMBER} ${typedRecord.STREETNAME}`
    },

    cityProvince: (): string => 'Sault Ste. Marie, ON',

    latitude: 'LATITUDE',
    longitude: 'LONGITUDE'
  }
}

export default config
