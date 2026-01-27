import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getAvailableEmployees(shiftDateString) {
    const pool = await getShiftLogConnectionPool();
    const instance = getConfigProperty('application.instance');
    const result = await pool
        .request()
        .input('instance', instance)
        .input('shiftDateString', shiftDateString)
        .query(/* sql */ `
      SELECT
        e.employeeNumber,
        e.firstName,
        e.lastName,
        e.isSupervisor
      FROM
        ShiftLog.Employees e
      WHERE
        e.instance = @instance
        AND e.recordDelete_dateTime IS NULL
        AND e.employeeNumber NOT IN (
          SELECT
            se.employeeNumber
          FROM
            ShiftLog.ShiftEmployees se
            INNER JOIN ShiftLog.Shifts s ON se.shiftId = s.shiftId
          WHERE
            s.instance = @instance
            AND s.recordDelete_dateTime IS NULL
            AND s.shiftDate = @shiftDateString
        )
      ORDER BY
        e.lastName,
        e.firstName
    `);
    return result.recordset;
}
