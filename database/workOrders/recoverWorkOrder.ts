/* eslint-disable no-secrets/no-secrets */

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js'
import { deleteUserName } from '../cleanup/permanentlyDeleteRecords.js'

const workOrderTablesToRestore = [
  'ShiftLog.WorkOrderAttachments',
  'ShiftLog.WorkOrderCosts',
  'ShiftLog.WorkOrderEquipment',
  'ShiftLog.WorkOrderMilestones',
  'ShiftLog.WorkOrderNotes',
  'ShiftLog.WorkOrderSubscribers'
]

export default async function recoverWorkOrder(
  workOrderId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .query<Record<string, never>>(/* sql */ `
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
    `)

  if (result.rowsAffected[0] > 0) {
    for (const tableName of workOrderTablesToRestore) {
      // eslint-disable-next-line no-await-in-loop
      await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', userName)
        .input('deleteUserName', deleteUserName)
        .query(/* sql */ `
          UPDATE ${tableName}
          SET
            recordDelete_userName = NULL,
            recordDelete_dateTime = NULL,
            recordUpdate_userName = @userName,
            recordUpdate_dateTime = getdate()
          WHERE
            workOrderId = @workOrderId
            AND recordDelete_dateTime IS NOT NULL
            AND recordDelete_userName = @deleteUserName
        `)
    }

    // Send Notification
    sendNotificationWorkerMessage(
      'workOrder.update',
      typeof workOrderId === 'string'
        ? Number.parseInt(workOrderId, 10)
        : workOrderId
    )
  }

  return result.rowsAffected[0] > 0
}
