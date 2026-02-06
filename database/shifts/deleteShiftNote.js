import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteShiftNote(shiftId, noteSequence, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('shiftId', shiftId)
        .input('noteSequence', noteSequence)
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.ShiftNotes
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      WHERE
        shiftId = @shiftId
        AND noteSequence = @noteSequence
        AND recordDelete_dateTime IS NULL
        AND shiftId IN (
          SELECT
            shiftId
          FROM
            ShiftLog.Shifts
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
    `);
    return result.rowsAffected[0] > 0;
}
