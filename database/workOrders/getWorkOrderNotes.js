// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, unicorn/no-null */
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderNotes(workOrderId) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool.request().input('workOrderId', workOrderId)
        .query(/* sql */ `
      select
        workOrderId,
        noteSequence,
        noteText,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime,
        recordDelete_userName,
        recordDelete_dateTime
      from ShiftLog.WorkOrderNotes
      where workOrderId = @workOrderId
        and recordDelete_dateTime is null
      order by noteSequence desc
    `));
    return result.recordset;
}
