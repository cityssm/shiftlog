import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function deleteEmployee(employeeNumber, user) {
    const currentDate = new Date();
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const result = await pool
        .request()
        .input('employeeNumber', employeeNumber)
        .input('recordDelete_userName', user.userName)
        .input('recordDelete_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.Employees
        set recordDelete_userName = @recordDelete_userName,
        recordDelete_dateTime = @recordDelete_dateTime
      where employeeNumber = @employeeNumber
        and recordDelete_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
