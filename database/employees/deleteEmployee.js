import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteEmployee(employeeNumber, user) {
    const currentDate = new Date();
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('employeeNumber', employeeNumber)
        .input('recordDelete_userName', user.userName)
        .input('recordDelete_dateTime', currentDate)
        .query(/* sql */ `
      UPDATE ShiftLog.Employees
      SET
        recordDelete_userName = @recordDelete_userName,
        recordDelete_dateTime = @recordDelete_dateTime
      WHERE
        instance = @instance
        AND employeeNumber = @employeeNumber
        AND recordDelete_dateTime IS NULL
    `);
    return result.rowsAffected[0] > 0;
}
