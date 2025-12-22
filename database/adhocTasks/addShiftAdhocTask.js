import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addShiftAdhocTask(shiftId, adhocTaskId, shiftAdhocTaskNote) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('shiftId', shiftId)
        .input('adhocTaskId', adhocTaskId)
        .input('shiftAdhocTaskNote', shiftAdhocTaskNote)
        .query(
    /* sql */ `
        insert into ShiftLog.ShiftAdhocTasks (
          shiftId,
          adhocTaskId,
          shiftAdhocTaskNote
        ) values (
          @shiftId,
          @adhocTaskId,
          @shiftAdhocTaskNote
        )
      `);
    return result.rowsAffected[0] > 0;
}
