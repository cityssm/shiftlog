/* eslint-disable @cspell/spellchecker -- GIS column names */

import type { Config } from '../../types/config.types.js'

import { config as baseConfig } from './publicWorks.partialConfig.js'

export const config: Config = { ...baseConfig }

config.reverseProxy = {
  trafficIsForwarded: true,
  urlPrefix: '/publicWorks'
}

config.workOrders = {
  isEnabled: false
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
    address1: (record: unknown): string | undefined => {
      const typedRecord = record as { CIVICNUMBER: number; STREETNAME: string }
      return `${typedRecord.CIVICNUMBER} ${typedRecord.STREETNAME}`
    },

    cityProvince: (): string => 'Sault Ste. Marie, ON',

    latitude: 'LATITUDE',
    longitude: 'LONGITUDE'
  }
}

export default config
