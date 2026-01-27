import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateShiftAdhocTaskNote(shiftId, adhocTaskId, shiftAdhocTaskNote) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('shiftId', shiftId)
        .input('adhocTaskId', adhocTaskId)
        .input('shiftAdhocTaskNote', shiftAdhocTaskNote)
        .query(/* sql */ `
      UPDATE ShiftLog.ShiftAdhocTasks
      SET
        shiftAdhocTaskNote = @shiftAdhocTaskNote
      WHERE
        shiftId = @shiftId
        AND adhocTaskId = @adhocTaskId
    `);
    return result.rowsAffected[0] > 0;
}
