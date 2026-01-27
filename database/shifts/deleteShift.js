import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteShift(shiftId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.Shifts
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      WHERE
        shiftId = @shiftId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `));
    return result.rowsAffected[0] > 0;
}
