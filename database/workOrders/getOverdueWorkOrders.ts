import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

export default async function getOverdueWorkOrders(
  limit: number,
  user?: User
): Promise<WorkOrder[]> {
  const pool = await getShiftLogConnectionPool()

  let whereClause = `
    where w.recordDelete_dateTime is null
      and w.workOrderCloseDateTime is null
      and w.workOrderDueDateTime < getdate()
  `

  if (user !== undefined) {
    whereClause += `
      and (
        wType.userGroupId is null or wType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        )
      )
    `
  }

  const result = (await pool
    .request()
    .input('userName', user?.userName)
    .input('limit', limit).query(/* sql */ `
      select top(@limit)
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
        assignedTo.dataListItem as assignedToDataListItem
      from ShiftLog.WorkOrders w

      left join ShiftLog.DataListItems wType
        on w.workOrderTypeDataListItemId = wType.dataListItemId

      left join ShiftLog.DataListItems wStatus
        on w.workOrderStatusDataListItemId = wStatus.dataListItemId

      left join ShiftLog.DataListItems assignedTo
        on w.assignedToDataListItemId = assignedTo.dataListItemId

      ${whereClause}

      order by w.workOrderDueDateTime asc, w.workOrderNumber desc
    `)) as mssql.IResult<WorkOrder>

  return result.recordset
}
