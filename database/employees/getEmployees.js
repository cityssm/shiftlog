// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const orderByOptions = {
    employeeNumber: 'employeeNumber, lastName, firstName',
    name: 'lastName, firstName, employeeNumber'
};
export default async function getEmployees(filters, orderBy = 'name') {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const result = (await pool
        .request()
        .input('isSupervisor', filters?.isSupervisor).query(/* sql */ `
      select employeeNumber, firstName, lastName,
        userName, isSupervisor,
        phoneNumber, phoneNumberAlternate, emailAddress,
        userGroupId,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      from ShiftLog.Employees
      where recordDelete_dateTime is null
        ${filters?.isSupervisor === undefined ? '' : `and isSupervisor = @isSupervisor`}
      order by ${orderByOptions[orderBy] ?? orderByOptions.name}
  `));
    return result.recordset;
}
