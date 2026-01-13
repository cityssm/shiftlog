import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

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
      form.assignedToId && form.assignedToId !== ''
        ? form.assignedToId
        : null
    )
    .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderMilestones
      set
        milestoneTitle = @milestoneTitle,
        milestoneDescription = @milestoneDescription,
        milestoneDueDateTime = @milestoneDueDateTime,
        milestoneCompleteDateTime = @milestoneCompleteDateTime,
        assignedToId = @assignedToId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where workOrderMilestoneId = @workOrderMilestoneId
        and recordDelete_dateTime is null
        and workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
    `)

  return result.rowsAffected[0] > 0
}
