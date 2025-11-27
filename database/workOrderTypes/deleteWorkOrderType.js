import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteWorkOrderType(workOrderTypeId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderTypeId', workOrderTypeId)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderTypes
      set
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      where instance = @instance
        and workOrderTypeId = @workOrderTypeId
        and recordDelete_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
