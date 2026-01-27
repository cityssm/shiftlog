import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

export interface ShiftWorkOrder extends WorkOrder {
  shiftWorkOrderNote: string
}

export default async function getShiftWorkOrders(
  shiftId: number | string
): Promise<ShiftWorkOrder[]> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      SELECT
        w.workOrderId,
        w.workOrderNumberPrefix,
        w.workOrderNumberYear,
        w.workOrderNumberSequence,
        w.workOrderNumberOverride,
        w.workOrderNumber,
        w.workOrderTypeId,
        wt.workOrderType,
        w.workOrderStatusDataListItemId,
        wsd.dataListItem AS workOrderStatusDataListItem,
        w.workOrderPriorityDataListItemId,
        wpd.dataListItem AS workOrderPriorityDataListItem,
        w.workOrderDetails,
        w.workOrderOpenDateTime,
        w.workOrderDueDateTime,
        w.workOrderCloseDateTime,
        w.requestorName,
        w.requestorContactInfo,
        w.assignedToDataListItemId,
        atd.dataListItem AS assignedToDataListItem,
        w.locationAddress1,
        w.locationAddress2,
        w.locationCityProvince,
        w.locationLatitude,
        w.locationLongitude,
        sw.shiftWorkOrderNote,
        w.recordCreate_userName,
        w.recordCreate_dateTime,
        w.recordUpdate_userName,
        w.recordUpdate_dateTime
      FROM
        ShiftLog.ShiftWorkOrders sw
        INNER JOIN ShiftLog.WorkOrders w ON sw.workOrderId = w.workOrderId
        INNER JOIN ShiftLog.WorkOrderTypes wt ON w.workOrderTypeId = wt.workOrderTypeId
        LEFT JOIN ShiftLog.DataListItems wsd ON w.workOrderStatusDataListItemId = wsd.dataListItemId
        LEFT JOIN ShiftLog.DataListItems wpd ON w.workOrderPriorityDataListItemId = wpd.dataListItemId
        LEFT JOIN ShiftLog.DataListItems atd ON w.assignedToDataListItemId = atd.dataListItemId
      WHERE
        sw.shiftId = @shiftId
        AND w.instance = @instance
        AND w.recordDelete_dateTime IS NULL
      ORDER BY
        w.workOrderNumber DESC
    `)) as mssql.IResult<ShiftWorkOrder>

  return result.recordset
}
