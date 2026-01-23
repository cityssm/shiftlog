/* eslint-disable @cspell/spellchecker -- GIS column names */
import { config as baseConfig } from './accessibility.partialConfig.js';
export const config = { ...baseConfig };
config.application.attachmentStoragePath = 'data/attachments/accessibility';
config.reverseProxy = {
    trafficIsForwarded: true,
    urlPrefix: '/accessibility'
};
config.locations = {
    syncSource: 'arcgis',
    layerURL: 'https://enterprise.ssmic.com/server/rest/services/SooMaps/SooMaps_GeneralLayers/MapServer/0',
    whereClause: "MUNICIPALITY = 'SSM'",
    mappings: {
        address1: (record) => `${record.CIVICNUMBER} ${record.STREETNAME}`,
        cityProvince: () => 'Sault Ste. Marie, ON',
        latitude: 'LATITUDE',
        longitude: 'LONGITUDE'
    }
};
export default config;
