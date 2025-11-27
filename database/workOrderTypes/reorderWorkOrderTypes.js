import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function reorderWorkOrderTypes(workOrderTypeIds, userName) {
    const pool = await getShiftLogConnectionPool();
    for (const [index, workOrderTypeId] of workOrderTypeIds.entries()) {
        await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('workOrderTypeId', workOrderTypeId)
            .input('orderNumber', index)
            .input('userName', userName).query(/* sql */ `
        update ShiftLog.WorkOrderTypes
        set
          orderNumber = @orderNumber,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
        where instance = @instance
          and workOrderTypeId = @workOrderTypeId
          and recordDelete_dateTime is null
      `);
    }
    return true;
}
