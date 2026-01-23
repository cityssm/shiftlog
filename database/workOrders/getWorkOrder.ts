import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'
import getWorkOrderTags from '../workOrders/getWorkOrderTags.js'

export default async function getWorkOrder(
  workOrderId: number | string,
  userName?: string
): Promise<WorkOrder | undefined> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    select
      w.workOrderId,
      w.workOrderNumberYear,
      w.workOrderNumberSequence,
      w.workOrderNumber,

      w.workOrderTypeId,
      wType.workOrderType,

      w.workOrderStatusDataListItemId,
      wStatus.dataListItem as workOrderStatusDataListItem,

      w.workOrderPriorityDataListItemId,
      wPriority.dataListItem as workOrderPriorityDataListItem,

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

      moreInfoFormDataJson

    from ShiftLog.WorkOrders w

    left join ShiftLog.WorkOrderTypes wType
      on w.workOrderTypeId = wType.workOrderTypeId

    left join ShiftLog.DataListItems wStatus
      on w.workOrderStatusDataListItemId = wStatus.dataListItemId

    left join ShiftLog.DataListItems wPriority
      on w.workOrderPriorityDataListItemId = wPriority.dataListItemId

    left join ShiftLog.AssignedTo assignedTo
      on w.assignedToId = assignedTo.assignedToId

    where w.recordDelete_dateTime is null
      and w.workOrderId = @workOrderId
      and w.instance = @instance

    ${
      userName === undefined
        ? ''
        : `
            and (
              wType.userGroupId is null or wType.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
          `
    }    
  `

  try {
    const workOrdersResult = (await pool
      .request()
      .input('workOrderId', workOrderId)
      .input('instance', getConfigProperty('application.instance'))
      .input('userName', userName)
      .query(sql)) as mssql.IResult<WorkOrder>

    if (workOrdersResult.recordset.length === 0) {
      return undefined
    }

    const workOrder = workOrdersResult.recordset[0]

    if (workOrder.moreInfoFormDataJson === undefined) {
      workOrder.moreInfoFormData = {}
    } else {
      try {
        workOrder.moreInfoFormData = JSON.parse(
          workOrder.moreInfoFormDataJson
        ) as Record<string, unknown>
      } catch {
        workOrder.moreInfoFormData = {}
      }
    }

    // Get tags for this work order
    workOrder.tags = await getWorkOrderTags(workOrder.workOrderId)

    return workOrder
  } catch {
    return undefined
  }
}
