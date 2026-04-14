import { config as baseConfig } from './publicWorks.partialConfig.js';
export const config = { ...baseConfig };
config.reverseProxy = {
    trafficIsForwarded: true,
    urlPrefix: '/publicWorks'
};
config.workOrders = {
    isEnabled: false
};
config.employees = {
    syncSource: 'pearl',
    filters: {
        departments: ['530', '310', '320', '322'],
        employeeIsActive: true
    }
};
config.equipment = {
    syncSource: 'pearl',
    filters: {
        departmentsOwned: ['Works Fleet', 'Parks Fleet'],
        equipmentStatuses: ['Active']
    }
};
config.locations = {
    syncSource: 'arcgis',
    layerURL: 'https://enterprise.ssmic.com/server/rest/services/SooMaps/SooMaps_GeneralLayers/MapServer/0',
    whereClause: "MUNICIPALITY = 'SSM'",
    mappings: {
        address1: (record) => {
            const typedRecord = record;
            return `${typedRecord.CIVICNUMBER} ${typedRecord.STREETNAME}`;
        },
        cityProvince: () => 'Sault Ste. Marie, ON',
        latitude: 'LATITUDE',
        longitude: 'LONGITUDE'
    }
};
export default config;
