import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
export default async function updateWorkOrderMilestone(form, userName) {
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
    .query(/* sql */ `
      UPDATE ShiftLog.WorkOrderMilestones
      SET
        milestoneTitle = @milestoneTitle,
        milestoneDescription = @milestoneDescription,
        milestoneDueDateTime = @milestoneDueDateTime,
        milestoneCompleteDateTime = @milestoneCompleteDateTime,
        assignedToId = @assignedToId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
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
  return result.rowsAffected[0] > 0
}
