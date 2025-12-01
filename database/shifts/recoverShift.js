import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function recoverShift(shiftId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.Shifts
      set
        recordDelete_userName = null,
        recordDelete_dateTime = null,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where shiftId = @shiftId
        and instance = @instance
        and recordDelete_dateTime is not null
    `));
    return result.rowsAffected[0] > 0;
}
