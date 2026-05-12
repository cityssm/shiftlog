import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

export default async function getOverdueWorkOrders(
  limit: number,
  user?: User
): Promise<Array<Partial<WorkOrder>>> {
  const pool = await getShiftLogConnectionPool()

  let whereClause = /* sql */ `
    WHERE
      w.recordDelete_dateTime IS NULL
      AND w.workOrderCloseDateTime IS NULL
      AND w.workOrderDueDateTime < getdate()
      AND w.instance = @instance
  `

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

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName)
    .input('limit', limit)
    .query<WorkOrder>(/* sql */ `
      SELECT
        TOP (@limit) w.workOrderId,
        w.workOrderNumber,
        wType.workOrderType,
        wStatus.dataListItem AS workOrderStatusDataListItem,
        w.workOrderOpenDateTime,
        w.workOrderDueDateTime,
        w.workOrderCloseDateTime,
        w.requestorName,
        w.locationAddress1,
        w.locationAddress2,
        w.locationCityProvince,
        assignedTo.assignedToName
      FROM
        ShiftLog.WorkOrders w
        LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
        LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId
        LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId ${whereClause}
      ORDER BY
        w.workOrderDueDateTime ASC,
        w.workOrderNumber DESC
    `)

  return result.recordset
}
