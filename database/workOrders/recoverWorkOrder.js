import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function recoverWorkOrder(workOrderId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.WorkOrders
      SET
        recordDelete_userName = NULL,
        recordDelete_dateTime = NULL,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        workOrderId = @workOrderId
        AND instance = @instance
        AND recordDelete_dateTime IS NOT NULL
    `));
    return result.rowsAffected[0] > 0;
}
