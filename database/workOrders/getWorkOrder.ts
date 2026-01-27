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
    SELECT
      w.workOrderId,
      w.workOrderNumberYear,
      w.workOrderNumberSequence,
      w.workOrderNumber,
      w.workOrderTypeId,
      wType.workOrderType,
      w.workOrderStatusDataListItemId,
      wStatus.dataListItem AS workOrderStatusDataListItem,
      w.workOrderPriorityDataListItemId,
      wPriority.dataListItem AS workOrderPriorityDataListItem,
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
    FROM
      ShiftLog.WorkOrders w
      LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
      LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId
      LEFT JOIN ShiftLog.DataListItems wPriority ON w.workOrderPriorityDataListItemId = wPriority.dataListItemId
      LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId
    WHERE
      w.recordDelete_dateTime IS NULL
      AND w.workOrderId = @workOrderId
      AND w.instance = @instance ${userName === undefined
        ? ''
        : /* sql */ `
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
          `}
  `

  try {
    const workOrdersResult = await pool
      .request()
      .input('workOrderId', workOrderId)
      .input('instance', getConfigProperty('application.instance'))
      .input('userName', userName)
      .query<WorkOrder>(sql)

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
