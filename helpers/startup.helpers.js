import Debug from 'debug';
import createDataList from '../database/app/createDataList.js';
import getDataLists from '../database/app/getDataLists.js';
import { DEBUG_NAMESPACE } from '../debug.config.js';
const debug = Debug(`${DEBUG_NAMESPACE}:startup`);
export const REQUIRED_SYSTEM_LISTS = {
    equipmentTypes: 'Equipment Types',
    workOrderPriorities: 'Work Orders - Priorities',
    workOrderStatuses: 'Work Orders - Statuses',
    adhocTaskTypes: 'Adhoc Task Types',
    shiftTimes: 'Shifts - Times',
    shiftTypes: 'Shifts - Types',
    jobClassifications: 'Timesheets - Job Classifications',
    timeCodes: 'Timesheets - Time Codes',
    timesheetTypes: 'Timesheets - Types'
};
export async function validateSystemLists() {
    debug('Validating system lists...');
    const dataLists = await getDataLists();
    const existingSystemListKeys = new Set(dataLists
        .filter((list) => list.isSystemList)
        .map((list) => list.dataListKey));
    const missingSystemLists = Object.keys(REQUIRED_SYSTEM_LISTS).filter((requiredKey) => !existingSystemListKeys.has(requiredKey));
    for (const missingKey of missingSystemLists) {
        const listName = REQUIRED_SYSTEM_LISTS[missingKey];
        debug(`Missing required system list: ${missingKey} (${listName}), creating...`);
        await createDataList({
            dataListKey: missingKey,
            dataListName: listName,
            isSystemList: true
        }, 'system');
    }
    debug(`All ${Object.keys(REQUIRED_SYSTEM_LISTS).length} required system lists are present`);
}
