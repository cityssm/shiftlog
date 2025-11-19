import { AvantiApi } from '@cityssm/avanti-api';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:tasks:employeeSync:avanti.employeeSync`);
export default async function getEmployees() {
    const employeeConfig = getConfigProperty('employees');
    if (employeeConfig.syncSource !== 'avanti') {
        return undefined;
    }
    const avantiConfig = getConfigProperty('connectors.avanti');
    if (avantiConfig === undefined) {
        return undefined;
    }
    const avantiApi = new AvantiApi(avantiConfig);
    const avantiEmployees = await avantiApi.getEmployees(employeeConfig.filters ?? {});
    if (!avantiEmployees.success) {
        debug('Failed to retrieve employees from Avanti API', avantiEmployees.error);
        return undefined;
    }
    const employees = [];
    for (const avantiEmployee of avantiEmployees.response.employees ?? []) {
        const employee = {
            employeeNumber: avantiEmployee.empNo ?? '',
            firstName: (avantiEmployee.preferredName ?? '') === ''
                ? (avantiEmployee.givenName ?? '')
                : (avantiEmployee.preferredName ?? ''),
            lastName: avantiEmployee.surname ?? '',
            emailAddress: avantiEmployee.email ?? '',
            recordSync_dateTime: new Date(),
            recordSync_isSynced: true,
            recordSync_source: 'avanti'
        };
        employees.push(employee);
    }
    return employees;
}
