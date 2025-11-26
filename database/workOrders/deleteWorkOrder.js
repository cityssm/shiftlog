import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteWorkOrder(workOrderId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrders
      set
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      where workOrderId = @workOrderId
        and instance = @instance
        and recordDelete_dateTime is null
    `));
    return result.rowsAffected[0] > 0;
}
