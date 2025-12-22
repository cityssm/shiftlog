import downloadLayer from '@cityssm/esri-mapserver-layer-dl';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getLocations() {
    const locationConfig = getConfigProperty('locations');
    if (locationConfig.syncSource !== 'arcgis') {
        return undefined;
    }
    const response = await downloadLayer(locationConfig.layerURL, {
        where: locationConfig.whereClause ?? '1=1'
    });
    const locations = [];
    for (const gisRecord of response) {
        const location = {
            recordSync_isSynced: true,
            recordSync_source: 'arcgis'
        };
        for (const [fieldName, mapping] of Object.entries(locationConfig.mappings)) {
            let value;
            if (typeof mapping === 'function') {
                value = mapping(gisRecord);
            }
            else if (typeof mapping === 'string') {
                // eslint-disable-next-line security/detect-object-injection
                value = gisRecord[mapping];
            }
            if (value !== undefined) {
                location[fieldName] =
                    value;
            }
        }
        locations.push(location);
    }
    return locations;
}
