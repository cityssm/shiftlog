import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteAdhocTask(adhocTaskId, sessionUser) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('adhocTaskId', adhocTaskId)
        .input('recordDelete_userName', sessionUser.userName)
        .query(
    /* sql */ `
        update ShiftLog.AdhocTasks
        set
          recordDelete_userName = @recordDelete_userName,
          recordDelete_dateTime = getdate()
        where adhocTaskId = @adhocTaskId
          and recordDelete_dateTime is null
      `);
    return result.rowsAffected[0] > 0;
}
