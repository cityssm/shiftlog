// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, unicorn/no-null */
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteWorkOrder(workOrderId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrders
      set
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      where workOrderId = @workOrderId
        and recordDelete_dateTime is null
    `));
    return result.rowsAffected[0] > 0;
}
