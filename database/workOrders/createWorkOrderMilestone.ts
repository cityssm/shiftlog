import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js'

import getWorkOrder from './getWorkOrder.js'

export interface CreateWorkOrderMilestoneForm {
  workOrderId: number | string

  milestoneTitle: string

  milestoneDescription?: string

  milestoneCompleteDateTimeString?: string
  milestoneDueDateTimeString?: string

  assignedToId?: number | string
}

export default async function createWorkOrderMilestone(
  form: CreateWorkOrderMilestoneForm,
  userName: string
): Promise<number | undefined> {
  const workOrder = await getWorkOrder(form.workOrderId)

  if (workOrder === undefined) {
    return undefined
  }

  const pool = await getShiftLogConnectionPool()

  // Get the next order number
  const orderResult = await pool
    .request()
    .input('workOrderId', form.workOrderId)
    .query<{ nextOrderNumber: number }>(/* sql */ `
      SELECT
        isnull(max(orderNumber), 0) + 1 AS nextOrderNumber
      FROM
        ShiftLog.WorkOrderMilestones
      WHERE
        workOrderId = @workOrderId
        AND recordDelete_dateTime IS NULL
    `)

  const nextOrderNumber = orderResult.recordset[0].nextOrderNumber

  const result = await pool
    .request()
    .input('workOrderId', form.workOrderId)
    .input('milestoneTitle', form.milestoneTitle)
    .input('milestoneDescription', form.milestoneDescription ?? '')
    .input(
      'milestoneDueDateTime',
      form.milestoneDueDateTimeString
        ? new Date(form.milestoneDueDateTimeString)
        : null
    )
    .input(
      'milestoneCompleteDateTime',
      form.milestoneCompleteDateTimeString
        ? new Date(form.milestoneCompleteDateTimeString)
        : null
    )
    .input(
      'assignedToId',
      form.assignedToId && form.assignedToId !== '' ? form.assignedToId : null
    )
    .input('orderNumber', nextOrderNumber)
    .input('userName', userName)
    .query<{ workOrderMilestoneId: number }>(/* sql */ `
      INSERT INTO
        ShiftLog.WorkOrderMilestones (
          workOrderId,
          milestoneTitle,
          milestoneDescription,
          milestoneDueDateTime,
          milestoneCompleteDateTime,
          assignedToId,
          orderNumber,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.workOrderMilestoneId
      VALUES
        (
          @workOrderId,
          @milestoneTitle,
          @milestoneDescription,
          @milestoneDueDateTime,
          @milestoneCompleteDateTime,
          @assignedToId,
          @orderNumber,
          @userName,
          @userName
        )
    `)

  if (result.rowsAffected[0] > 0) {
    // Send Notification
    sendNotificationWorkerMessage(
      'workOrder.update',
      typeof form.workOrderId === 'string'
        ? Number.parseInt(form.workOrderId, 10)
        : form.workOrderId
    )
  }

  return result.recordset[0].workOrderMilestoneId
}
