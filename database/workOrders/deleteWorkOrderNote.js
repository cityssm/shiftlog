import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteWorkOrderNote(workOrderId, noteSequence, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderId', workOrderId)
        .input('noteSequence', noteSequence)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderNotes
      set
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      where workOrderId = @workOrderId
        and noteSequence = @noteSequence
        and recordDelete_dateTime is null
        and workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
    `));
    return result.rowsAffected[0] > 0;
}
