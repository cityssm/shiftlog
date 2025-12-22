import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function isAdhocTaskOnShift(shiftId, adhocTaskId) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('adhocTaskId', adhocTaskId)
        .query(
    /* sql */ `
        select count(*) as recordCount
        from ShiftLog.ShiftAdhocTasks
        where shiftId = @shiftId
          and adhocTaskId = @adhocTaskId
      `));
    return result.recordset[0].recordCount > 0;
}
