import { fork } from 'node:child_process';
import { getConfigProperty } from '../helpers/config.helpers.js';
export function initializeTasks() {
    const childProcesses = {};
    if (getConfigProperty('employees.syncSource') !== '') {
        const childProcess = fork('./tasks/employeeSync/task.js', {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'inherit'
        });
        childProcesses.employeeSync = childProcess;
    }
    if (getConfigProperty('equipment.syncSource') !== '') {
        const childProcess = fork('./tasks/equipmentSync/task.js', {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'inherit'
        });
        childProcesses.equipmentSync = childProcess;
    }
    if (getConfigProperty('locations.syncSource') !== '') {
        const childProcess = fork('./tasks/locationSync/task.js', {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'inherit'
        });
        childProcesses.locationSync = childProcess;
    }
    if (getConfigProperty('notifications.protocols').length > 0) {
        const notificationTask = fork('./tasks/notifications/task.js', {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'inherit'
        });
        childProcesses.notifications = notificationTask;
    }
    if (getConfigProperty('connectors.msGraph') !== undefined) {
        const msGraphTask = fork('./tasks/workOrderMsGraph/task.js', {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'inherit'
        });
        childProcesses.workOrderMsGraph = msGraphTask;
    }
    const cleanupTask = fork('./tasks/databaseCleanup/task.js', {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit'
    });
    childProcesses.databaseCleanup = cleanupTask;
    return childProcesses;
}
