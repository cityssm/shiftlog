import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateWorkOrderCost(updateWorkOrderCostForm, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderCostId', updateWorkOrderCostForm.workOrderCostId)
        .input('costAmount', updateWorkOrderCostForm.costAmount)
        .input('costDescription', updateWorkOrderCostForm.costDescription)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderCosts
      set
        costAmount = @costAmount,
        costDescription = @costDescription,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where workOrderCostId = @workOrderCostId
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
