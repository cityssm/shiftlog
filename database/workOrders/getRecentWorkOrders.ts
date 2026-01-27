import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

export default async function getRecentWorkOrders(
  limit: number,
  user?: User
): Promise<WorkOrder[]> {
  const pool = await getShiftLogConnectionPool()

  let whereClause =
    'where w.instance = @instance and w.recordDelete_dateTime is null'

  if (user !== undefined) {
    whereClause += /* sql */ `
      AND (
        wType.userGroupId IS NULL
        OR wType.userGroupId IN (
          SELECT
            userGroupId
          FROM
            ShiftLog.UserGroupMembers
          WHERE
            userName = @userName
        )
      )
    `
  }

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName)
    .input('limit', limit)
    .query(/* sql */ `
      SELECT
        TOP (@limit) w.workOrderId,
        w.workOrderNumberYear,
        w.workOrderNumberSequence,
        isnull(wType.workOrderNumberPrefix, '') + cast(w.workOrderNumberYear AS VARCHAR(4)) + '-' + right(
          '000000' + cast(w.workOrderNumberSequence AS VARCHAR(6)),
          6
        ) AS workOrderNumber,
        w.workOrderTypeId,
        wType.workOrderType,
        w.workOrderStatusDataListItemId,
        wStatus.dataListItem AS workOrderStatusDataListItem,
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
        assignedTo.assignedToName
      FROM
        ShiftLog.WorkOrders w
        LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
        LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId
        LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId ${whereClause}
      ORDER BY
        w.recordUpdate_dateTime DESC
    `)) as mssql.IResult<WorkOrder>

  return result.recordset
}
