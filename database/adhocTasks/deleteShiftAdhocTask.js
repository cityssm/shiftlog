import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteShiftAdhocTask(shiftId, adhocTaskId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('shiftId', shiftId)
        .input('adhocTaskId', adhocTaskId)
        .query(/* sql */ `
      DELETE FROM ShiftLog.ShiftAdhocTasks
      WHERE
        shiftId = @shiftId
        AND adhocTaskId = @adhocTaskId
    `);
    return result.rowsAffected[0] > 0;
}
