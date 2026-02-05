import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js'

import getWorkOrder from './getWorkOrder.js'

export interface CreateWorkOrderCostForm {
  workOrderId: number | string
  costAmount: number | string
  costDescription: string
}

export default async function createWorkOrderCost(
  createWorkOrderCostForm: CreateWorkOrderCostForm,
  userName: string
): Promise<number | undefined> {
  const workOrder = await getWorkOrder(createWorkOrderCostForm.workOrderId)

  if (workOrder === undefined) {
    return undefined
  }

  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderId', createWorkOrderCostForm.workOrderId)
    .input('costAmount', createWorkOrderCostForm.costAmount)
    .input('costDescription', createWorkOrderCostForm.costDescription)
    .input('userName', userName)
    .query<{ workOrderCostId: number }>(/* sql */ `
      INSERT INTO
        ShiftLog.WorkOrderCosts (
          workOrderId,
          costAmount,
          costDescription,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.workOrderCostId
      VALUES
        (
          @workOrderId,
          @costAmount,
          @costDescription,
          @userName,
          @userName
        )
    `)

  if (result.rowsAffected[0] > 0) {
    // Send Notification
    sendNotificationWorkerMessage(
      'workOrder.update',
      typeof createWorkOrderCostForm.workOrderId === 'string'
        ? Number.parseInt(createWorkOrderCostForm.workOrderId, 10)
        : createWorkOrderCostForm.workOrderId
    )
  }

  return result.recordset[0].workOrderCostId
}
