import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function markEmployeesAsEntered(timesheetId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('timesheetId', timesheetId)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.Timesheets
      set
        employeesEntered_dateTime = getdate(),
        employeesEntered_userName = @userName
      where timesheetId = @timesheetId
        and recordDelete_dateTime is null
        and recordSubmitted_dateTime is not null
        and employeesEntered_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
