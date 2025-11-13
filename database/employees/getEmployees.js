import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getEmployees() {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const result = (await pool.request().query(/* sql */ `
    select employeeNumber, firstName, lastName,
      userName, isSupervisor,
      phoneNumber, phoneNumberAlternate, emailAddress,
      userGroupId,
      recordCreate_userName, recordCreate_dateTime,
      recordUpdate_userName, recordUpdate_dateTime
    from ShiftLog.Employees
    where recordDelete_dateTime is null
    order by lastName, firstName
  `));
    return result.recordset;
}
