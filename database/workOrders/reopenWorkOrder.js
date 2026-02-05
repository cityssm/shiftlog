import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js';
export default async function reopenWorkOrder(workOrderId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.WorkOrders
      SET
        workOrderCloseDateTime = NULL,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        workOrderId = @workOrderId
        AND instance = @instance
        AND workOrderCloseDateTime IS NOT NULL
        AND recordDelete_dateTime IS NULL
    `);
    if (result.rowsAffected[0] > 0) {
        // Send Notification
        sendNotificationWorkerMessage('workOrder.update', typeof workOrderId === 'string'
            ? Number.parseInt(workOrderId, 10)
            : workOrderId);
    }
    return result.rowsAffected[0] > 0;
}
