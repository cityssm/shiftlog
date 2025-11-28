import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

export default async function getWorkOrder(
  workOrderId: number | string,
  user?: User
): Promise<WorkOrder | undefined> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    select
      w.workOrderId,
      w.workOrderNumberYear,
      w.workOrderNumberSequence,
      isnull(wType.workOrderNumberPrefix, '') + cast(w.workOrderNumberYear as varchar(4)) + '-' + right('000000' + cast(w.workOrderNumberSequence as varchar(6)),6) as workOrderNumber,

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

      w.assignedToDataListItemId,
      assignedTo.dataListItem as assignedToDataListItem,

      moreInfoFormDataJson

    from ShiftLog.WorkOrders w

    left join ShiftLog.WorkOrderTypes wType
      on w.workOrderTypeId = wType.workOrderTypeId

    left join ShiftLog.DataListItems wStatus
      on w.workOrderStatusDataListItemId = wStatus.dataListItemId

    left join ShiftLog.DataListItems assignedTo
      on w.assignedToDataListItemId = assignedTo.dataListItemId

    where w.recordDelete_dateTime is null
      and w.workOrderId = @workOrderId
      and w.instance = @instance

    ${
      user === undefined
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
  const workOrdersResult = (await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName)
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

  return workOrder
}
