// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @cspell/spellchecker */
import { config as baseConfig } from './graffitiTracking.partialConfig.js';
export const config = { ...baseConfig };
config.application.attachmentStoragePath = 'data/attachments/graffiti';
config.reverseProxy = {
    trafficIsForwarded: true,
    urlPrefix: '/graffiti'
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
