import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js'

export interface UpdateWorkOrderMilestoneForm {
  workOrderMilestoneId: number | string
  milestoneTitle: string
  milestoneDescription?: string
  milestoneDueDateTimeString?: string
  milestoneCompleteDateTimeString?: string
  assignedToId?: number | string
}

export default async function updateWorkOrderMilestone(
  form: UpdateWorkOrderMilestoneForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderMilestoneId', form.workOrderMilestoneId)
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
    .input('userName', userName)
    .query<{ workOrderId: number }>(/* sql */ `
      UPDATE ShiftLog.WorkOrderMilestones
      SET
        milestoneTitle = @milestoneTitle,
        milestoneDescription = @milestoneDescription,
        milestoneDueDateTime = @milestoneDueDateTime,
        milestoneCompleteDateTime = @milestoneCompleteDateTime,
        assignedToId = @assignedToId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate() OUTPUT inserted.workOrderId
      WHERE
        workOrderMilestoneId = @workOrderMilestoneId
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

  if (result.rowsAffected[0] > 0) {
    // Send Notification
    sendNotificationWorkerMessage(
      'workOrder.update',
      typeof result.recordset[0].workOrderId === 'string'
        ? Number.parseInt(result.recordset[0].workOrderId, 10)
        : result.recordset[0].workOrderId
    )
  }

  return result.rowsAffected[0] > 0
}
