import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderNotes(workOrderId) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('instance', getConfigProperty('application.instance'))
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
        and workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
      order by noteSequence desc
    `));
    return result.recordset;
}
