/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ScheduledTask } from '@cityssm/scheduled-task';
import { minutesToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import { Range } from 'node-schedule';
import addOrUpdateSyncedEmployee from '../../database/employees/addOrUpdateSyncedEmployee.js';
import getMaximumEmployeeRecordSyncDateTime from '../../database/employees/getMaximumEmployeeRecordSyncDateTime.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:tasks:employeeSync`);
const systemUserName = 'system';
const syncSource = getConfigProperty('employees.syncSource');
let syncFunction;
switch (syncSource) {
    case 'avanti': {
        const importedModule = await import('./avanti.employeeSync.js');
        syncFunction = importedModule.default;
        break;
    }
    case 'pearl': {
        const importedModule = await import('./pearl.employeeSync.js');
        syncFunction = importedModule.default;
        break;
    }
    default: {
        syncFunction = undefined;
    }
}
async function runSync() {
    if (syncFunction === undefined) {
        debug('No sync function defined; exiting');
        return;
    }
    debug('Running employee sync function');
    let employees = [];
    try {
        employees = await syncFunction();
        if (employees === undefined) {
            debug('No employees retrieved from sync function');
            return;
        }
        debug(`Employee sync function completed; retrieved ${employees.length} employees`);
    }
    catch (error) {
        debug('Error occurred during employee sync:', error);
    }
    for (const employeeToSync of employees ?? []) {
        if (employeeToSync.employeeNumber === undefined) {
            continue;
        }
        // eslint-disable-next-line no-await-in-loop
        await addOrUpdateSyncedEmployee(employeeToSync, systemUserName);
    }
}
if (syncFunction !== undefined) {
    debug(`Starting employee sync task for source: ${syncSource}`);
    const lastRunDateTime = await getMaximumEmployeeRecordSyncDateTime();
    const scheduledTask = new ScheduledTask(`Employee Sync (${syncSource})`, runSync, {
        schedule: {
            dayOfWeek: new Range(1, 5),
            hour: new Range(8, 16),
            minute: 0,
            second: 0
        },
        lastRunMillis: lastRunDateTime?.getTime(),
        minimumIntervalMillis: minutesToMillis(45),
        startTask: true
    });
    if (Date.now() - (lastRunDateTime?.getTime() ?? 0) > minutesToMillis(45)) {
        await scheduledTask.runTask();
    }
}
