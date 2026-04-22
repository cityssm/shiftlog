import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteWorkOrderSubscriber(workOrderId, subscriberSequence, userName) {
    try {
        const pool = await getShiftLogConnectionPool();
        const result = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('workOrderId', workOrderId)
            .input('subscriberSequence', subscriberSequence)
            .input('userName', userName)
            .query(`
        UPDATE ShiftLog.WorkOrderSubscribers
        SET
          recordDelete_userName = @userName,
          recordDelete_dateTime = getdate(),
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
        WHERE
          workOrderId = @workOrderId
          AND subscriberSequence = @subscriberSequence
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
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
