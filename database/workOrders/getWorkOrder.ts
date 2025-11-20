import type { mssql } from '@cityssm/mssql-multi-pool'

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
      w.workOrderNumber,

      w.workOrderTypeDataListItemId,
      wType.dataListItem as workOrderTypeDataListItem,

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

      w.userGroupId,
      ug.userGroupName

    from ShiftLog.WorkOrders w

    left join ShiftLog.DataListItems wType
      on w.workOrderTypeDataListItemId = wType.dataListItemId

    left join ShiftLog.DataListItems wStatus
      on w.workOrderStatusDataListItemId = wStatus.dataListItemId

    left join ShiftLog.DataListItems assignedTo
      on w.assignedToDataListItemId = assignedTo.dataListItemId

    left join ShiftLog.UserGroups ug
      on w.userGroupId = ug.userGroupId

    where w.recordDelete_dateTime is null
      and w.workOrderId = @workOrderId

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
    .input('userName', user?.userName)
    .query(sql)) as mssql.IResult<WorkOrder>

  if (workOrdersResult.recordset.length === 0) {
    return undefined
  }

  const workOrder = workOrdersResult.recordset[0]

  return workOrder
}
