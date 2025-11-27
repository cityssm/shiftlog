// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @cspell/spellchecker */

import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './publicWorks.partialConfig.js'

export const config: Config = { ...baseConfig }

config.reverseProxy = {
  trafficIsForwarded: true,
  urlPrefix: '/publicWorks'
}

config.employees = {
  syncSource: 'pearl',

  filters: {
    departments: ['530', '310', '320', '322'],
    employeeIsActive: true
  }
}

config.equipment = {
  syncSource: 'pearl',

  filters: {
    departmentsOwned: ['Works Fleet', 'Parks Fleet'],
    equipmentStatuses: ['Active']
  }
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
