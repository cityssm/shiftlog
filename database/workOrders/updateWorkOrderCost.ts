import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateWorkOrderCostForm {
  workOrderCostId: number | string
  costAmount: number | string
  costDescription: string
}

export default async function updateWorkOrderCost(
  updateWorkOrderCostForm: UpdateWorkOrderCostForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderCostId', updateWorkOrderCostForm.workOrderCostId)
    .input('costAmount', updateWorkOrderCostForm.costAmount)
    .input('costDescription', updateWorkOrderCostForm.costDescription)
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.WorkOrderCosts
      SET
        costAmount = @costAmount,
        costDescription = @costDescription,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        workOrderCostId = @workOrderCostId
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
    `)

  return result.rowsAffected[0] > 0
}
