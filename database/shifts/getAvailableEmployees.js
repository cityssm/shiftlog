import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export async function getAvailableEmployees(shiftDateString) {
    const pool = await getShiftLogConnectionPool();
    const instance = getConfigProperty('application.instance');
    const result = await pool
        .request()
        .input('instance', instance)
        .input('shiftDateString', shiftDateString).query(`
      select e.employeeNumber, e.firstName, e.lastName
      from ShiftLog.Employees e
      where e.instance = @instance
        and e.recordDelete_dateTime is null
        and e.employeeNumber not in (
          select se.employeeNumber
          from ShiftLog.ShiftEmployees se
          inner join ShiftLog.Shifts s on se.shiftId = s.shiftId
          where s.instance = @instance
            and s.recordDelete_dateTime is null
            and s.shiftDate = @shiftDateString
            and se.recordDelete_dateTime is null
        )
      order by e.lastName, e.firstName
    `);
    return result.recordset;
}
export default getAvailableEmployees;
