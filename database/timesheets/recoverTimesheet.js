import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function recoverTimesheet(timesheetId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('timesheetId', timesheetId)
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.Timesheets
      SET
        recordDelete_userName = NULL,
        recordDelete_dateTime = NULL,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        timesheetId = @timesheetId
        AND instance = @instance
        AND recordDelete_dateTime IS NOT NULL
    `));
    return result.rowsAffected[0] > 0;
}
