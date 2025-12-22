// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ScheduledTask } from '@cityssm/scheduled-task';
import { hoursToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import addOrUpdateSyncedLocation from '../../database/locations/addOrUpdateSyncedLocation.js';
import getMaximumLocationRecordSyncDateTime from '../../database/locations/getMaximumLocationRecordSyncDateTime.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:tasks:locationSync`);
const systemUserName = 'system';
const syncSource = getConfigProperty('locations.syncSource');
let syncFunction;
if (syncSource === 'arcgis') {
    const importedModule = await import('./arcgis.locationSync.js');
    syncFunction = importedModule.default;
}
async function runSync() {
    if (syncFunction === undefined) {
        debug('No sync function defined; exiting');
        return;
    }
    debug('Running location sync function');
    let locationList = [];
    try {
        locationList = await syncFunction();
        if (locationList === undefined) {
            debug('No locations retrieved from sync function');
            return;
        }
        debug(`Location sync function completed; retrieved ${locationList.length} locations`);
    }
    catch (error) {
        debug('Error occurred during location sync:', error);
    }
    for (const locationToSync of locationList ?? []) {
        // eslint-disable-next-line no-await-in-loop
        await addOrUpdateSyncedLocation(locationToSync, systemUserName);
    }
}
if (syncFunction !== undefined) {
    debug(`Starting location sync task for source: ${syncSource}`);
    const lastRunDateTime = await getMaximumLocationRecordSyncDateTime();
    const scheduledTask = new ScheduledTask(`Location Sync (${syncSource})`, runSync, {
        schedule: {
            dayOfWeek: 0,
            hour: 1,
            minute: 0,
            second: 0
        },
        lastRunMillis: lastRunDateTime?.getTime(),
        minimumIntervalMillis: hoursToMillis(12),
        startTask: true
    });
    if (Date.now() - (lastRunDateTime?.getTime() ?? 0) > hoursToMillis(12)) {
        await scheduledTask.runTask();
    }
}
