import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function markEquipmentAsEntered(timesheetId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('timesheetId', timesheetId)
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.Timesheets
      SET
        equipmentEntered_dateTime = getdate(),
        equipmentEntered_userName = @userName
      WHERE
        timesheetId = @timesheetId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
        AND recordSubmitted_dateTime IS NOT NULL
        AND equipmentEntered_dateTime IS NULL
    `);
    return result.rowsAffected[0] > 0;
}
