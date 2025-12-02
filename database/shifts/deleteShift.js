import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteShift(shiftId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.Shifts
      set
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      where shiftId = @shiftId
        and instance = @instance
        and recordDelete_dateTime is null
    `));
    return result.rowsAffected[0] > 0;
}
