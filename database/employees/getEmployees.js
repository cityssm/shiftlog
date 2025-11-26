// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
const orderByOptions = {
    employeeNumber: 'employeeNumber, lastName, firstName',
    name: 'lastName, firstName, employeeNumber'
};
export default async function getEmployees(filters = {}, orderBy = 'name') {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', filters.employeeNumber)
        .input('isSupervisor', filters.isSupervisor).query(/* sql */ `
      select employeeNumber, firstName, lastName,
        userName, isSupervisor,
        phoneNumber, phoneNumberAlternate, emailAddress,
        userGroupId,
        recordSync_isSynced, recordSync_source, recordSync_dateTime,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      from ShiftLog.Employees
      where
        instance = @instance
        ${(filters.includeDeleted ?? false) ? '' : 'and recordDelete_dateTime is null'}
        ${filters.employeeNumber === undefined ? '' : 'and employeeNumber = @employeeNumber'}
        ${filters.isSupervisor === undefined ? '' : 'and isSupervisor = @isSupervisor'}
      order by ${orderByOptions[orderBy] ?? orderByOptions.name}
  `);
    return result.recordset;
}
