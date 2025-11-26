import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateWorkOrderMilestone(form, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderMilestoneId', form.workOrderMilestoneId)
        .input('milestoneTitle', form.milestoneTitle)
        .input('milestoneDescription', form.milestoneDescription ?? '')
        .input('milestoneDueDateTime', form.milestoneDueDateTimeString
        ? new Date(form.milestoneDueDateTimeString)
        : null)
        .input('milestoneCompleteDateTime', form.milestoneCompleteDateTimeString
        ? new Date(form.milestoneCompleteDateTimeString)
        : null)
        .input('assignedToDataListItemId', form.assignedToDataListItemId && form.assignedToDataListItemId !== ''
        ? form.assignedToDataListItemId
        : null)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderMilestones
      set
        milestoneTitle = @milestoneTitle,
        milestoneDescription = @milestoneDescription,
        milestoneDueDateTime = @milestoneDueDateTime,
        milestoneCompleteDateTime = @milestoneCompleteDateTime,
        assignedToDataListItemId = @assignedToDataListItemId,
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
    `);
    return result.rowsAffected[0] > 0;
}
