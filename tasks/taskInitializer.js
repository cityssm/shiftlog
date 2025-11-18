import { getConfigProperty } from '../helpers/config.helpers.js';
export async function initializeEmployeeSyncTask() {
    const employeeConfig = getConfigProperty('employees');
    if (employeeConfig.syncSource === 'avanti') {
        const { initializeAvantiEmployeeSyncTask } = await import('../tasks/avantiEmployeeSync.task.js');
        return initializeAvantiEmployeeSyncTask();
    }
}
