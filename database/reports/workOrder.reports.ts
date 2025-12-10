import type { ReportDefinition } from './types.js'

export const workOrderReports: Record<string, ReportDefinition> = {
  'workOrders-open': {
    parameterNames: [],
    sql: /* sql */ `
       select
          w.workOrderId,
          w.workOrderNumber,
          wType.workOrderType,
          wStatus.dataListItem as workOrderStatus,
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

          assignedTo.dataListItem as assignedTo,

          milestones.milestonesCount,
          milestones.milestonesCompletedCount
          
        from ShiftLog.WorkOrders w

        left join ShiftLog.WorkOrderTypes wType
          on w.workOrderTypeId = wType.workOrderTypeId

        left join ShiftLog.DataListItems wStatus
          on w.workOrderStatusDataListItemId = wStatus.dataListItemId

        left join ShiftLog.DataListItems assignedTo
          on w.assignedToDataListItemId = assignedTo.dataListItemId

        left join (
          select workOrderId,
            count(*) as milestonesCount,
            sum(
              case when milestoneCompleteDateTime is null then 0 else 1 end
            ) as milestonesCompletedCount
          from ShiftLog.WorkOrderMilestones
          where recordDelete_dateTime is null
          group by workOrderId
        ) as milestones on milestones.workOrderId = w.workOrderId

        where w.recordDelete_dateTime is null
          and w.workOrderCloseDateTime is null
          and w.instance = @instance

        and (wType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        ) or wType.userGroupId is null)
    `
  },

  'workOrders-workOrderTags-unmanaged': {
    parameterNames: [],
    sql: /* sql */ `
      select wo.workOrderNumber, wot.tagName
      
      from ShiftLog.WorkOrderTags wot

      left join ShiftLog.WorkOrders wo
        on wot.workOrderId = wo.workOrderId

      left join ShiftLog.WorkOrderTypes woType
        on wo.workOrderTypeId = woType.workOrderTypeId

      left join ShiftLog.Tags t
        on wot.tagName = t.tagName and wo.instance = t.instance
        and t.recordDelete_dateTime is null

      where wo.recordDelete_dateTime is null
        and t.tagName is null
        and wo.instance = @instance

        and (
          woType.userGroupId in (
            select userGroupId
            from ShiftLog.UserGroupMembers
            where userName = @userName
          ) or woType.userGroupId is null
        )
    `
  }
}

export default workOrderReports
