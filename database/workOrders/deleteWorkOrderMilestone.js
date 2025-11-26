import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteWorkOrderMilestone(workOrderMilestoneId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderMilestoneId', workOrderMilestoneId)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderMilestones
      set
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      where workOrderMilestoneId = @workOrderMilestoneId
        and recordDelete_dateTime is null
        and workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
    `);
    return result.rowsAffected[0] > 0;
}
