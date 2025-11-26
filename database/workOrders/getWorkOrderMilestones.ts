import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderMilestone } from '../../types/record.types.js'

type WorkOrderMilestoneWithAssignedTo = WorkOrderMilestone & {
  assignedToDataListItem?: string
}

export default async function getWorkOrderMilestones(
  workOrderId: number | string
): Promise<WorkOrderMilestoneWithAssignedTo[]> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      select
        m.workOrderMilestoneId,
        m.workOrderId,
        m.milestoneTitle,
        m.milestoneDescription,
        m.milestoneDueDateTime,
        m.milestoneCompleteDateTime,
        m.assignedToDataListItemId,
        d.dataListItem as assignedToDataListItem,
        m.orderNumber,
        m.recordCreate_userName,
        m.recordCreate_dateTime,
        m.recordUpdate_userName,
        m.recordUpdate_dateTime
      from ShiftLog.WorkOrderMilestones m
      left join ShiftLog.DataListItems d on m.assignedToDataListItemId = d.dataListItemId
      where m.workOrderId = @workOrderId
        and m.recordDelete_dateTime is null
        and m.workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
      order by
        case when m.milestoneCompleteDateTime is null then 0 else 1 end,
        case when m.milestoneCompleteDateTime is null and m.milestoneDueDateTime is not null then 0 else 1 end,
        m.milestoneDueDateTime,
        m.orderNumber,
        m.workOrderMilestoneId
    `)) as mssql.IResult<WorkOrderMilestoneWithAssignedTo>

  return result.recordset
}
