import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder, WorkOrderMilestone } from '../../types/record.types.js'

export interface WorkOrderDigestItem extends WorkOrder {
  isOverdue: boolean
  isNew: boolean
}

export interface WorkOrderMilestoneDigestItem extends WorkOrderMilestone {
  workOrderNumber: string
  isOverdue: boolean
  isNew: boolean
}

const newItemHours = 48

export async function getWorkOrdersForDigest(
  assignedToId: number | string
): Promise<{
  workOrders: WorkOrderDigestItem[]
  milestones: WorkOrderMilestoneDigestItem[]
}> {
  const pool = await getShiftLogConnectionPool()

  // Fetch open work orders assigned to the selected value
  const workOrdersResult = await pool
    .request()
    .input('assignedToId', assignedToId)
    .input('instance', getConfigProperty('application.instance'))
    .input('newItemHours', newItemHours).query<WorkOrderDigestItem>(/* sql */ `
      select
        w.workOrderId,
        w.workOrderNumberPrefix,
        w.workOrderNumberYear,
        w.workOrderNumberSequence,
        w.workOrderNumberOverride,
        w.workOrderNumber,
        w.workOrderTypeId,
        wType.workOrderType,
        w.workOrderStatusDataListItemId,
        wStatus.dataListItem as workOrderStatusDataListItem,
        w.workOrderDetails,
        w.workOrderOpenDateTime,
        w.workOrderDueDateTime,
        w.workOrderCloseDateTime,
        w.requestorName,
        w.requestorContactInfo,
        w.locationLatitude,
        w.locationLongitude,
        w.locationAddress1,
        w.locationAddress2,
        w.locationCityProvince,
        w.assignedToId,
        assignedTo.assignedToName,
        case
          when w.workOrderDueDateTime is not null and w.workOrderDueDateTime < getdate() then 1
          else 0
        end as isOverdue,
        case
          when datediff(hour, w.workOrderOpenDateTime, getdate()) <= @newItemHours then 1
          else 0
        end as isNew
      from ShiftLog.WorkOrders w
      left join ShiftLog.WorkOrderTypes wType
        on w.workOrderTypeId = wType.workOrderTypeId
      left join ShiftLog.DataListItems wStatus
        on w.workOrderStatusDataListItemId = wStatus.dataListItemId
      left join ShiftLog.AssignedTo assignedTo
        on w.assignedToId = assignedTo.assignedToId
      where w.instance = @instance
        and w.recordDelete_dateTime is null
        and w.workOrderCloseDateTime is null
        and w.assignedToId = @assignedToId
      order by
        case when w.workOrderDueDateTime is not null and w.workOrderDueDateTime < getdate() then 0 else 1 end,
        w.workOrderDueDateTime,
        w.workOrderOpenDateTime desc
    `)

  // Fetch open milestones assigned to the selected value
  const milestonesResult = await pool
    .request()
    .input('assignedToId', assignedToId)
    .input('instance', getConfigProperty('application.instance'))
    .input('newItemHours', newItemHours)
    .query<WorkOrderMilestoneDigestItem>(/* sql */ `
      select
        m.workOrderMilestoneId,
        m.workOrderId,
        m.milestoneTitle,
        m.milestoneDescription,
        m.milestoneDueDateTime,
        m.milestoneCompleteDateTime,
        m.assignedToId,
        assignedTo.assignedToName,
        m.orderNumber,
        w.workOrderNumber,
        case
          when m.milestoneDueDateTime is not null and m.milestoneDueDateTime < getdate() then 1
          else 0
        end as isOverdue,
        case
          when datediff(hour, m.recordCreate_dateTime, getdate()) <= @newItemHours then 1
          else 0
        end as isNew
      from ShiftLog.WorkOrderMilestones m
      inner join ShiftLog.WorkOrders w
        on m.workOrderId = w.workOrderId
      left join ShiftLog.AssignedTo assignedTo
        on m.assignedToId = assignedTo.assignedToId
      where w.instance = @instance
        and w.recordDelete_dateTime is null
        and m.recordDelete_dateTime is null
        and w.workOrderCloseDateTime is null
        and m.milestoneCompleteDateTime is null
        and m.assignedToId = @assignedToId
      order by
        case when m.milestoneDueDateTime is not null and m.milestoneDueDateTime < getdate() then 0 else 1 end,
        m.milestoneDueDateTime,
        m.recordCreate_dateTime desc
    `)

  return {
    workOrders: workOrdersResult.recordset,
    milestones: milestonesResult.recordset
  }
}
