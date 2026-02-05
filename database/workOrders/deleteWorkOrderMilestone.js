import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js';
export default async function deleteWorkOrderMilestone(workOrderMilestoneId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderMilestoneId', workOrderMilestoneId)
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.WorkOrderMilestones
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate() OUTPUT inserted.workOrderId
      WHERE
        workOrderMilestoneId = @workOrderMilestoneId
        AND recordDelete_dateTime IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
    `);
    if (result.rowsAffected[0] > 0) {
        // Send Notification
        sendNotificationWorkerMessage('workOrder.update', typeof result.recordset[0].workOrderId === 'string'
            ? Number.parseInt(result.recordset[0].workOrderId, 10)
            : result.recordset[0].workOrderId);
    }
    return result.rowsAffected[0] > 0;
}
