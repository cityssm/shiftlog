import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShiftWorkOrders(shiftId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
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
        w.assignedToId,
        atd.assignedToName,
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
        LEFT JOIN ShiftLog.AssignedTo atd ON w.assignedToId = atd.assignedToId
      WHERE
        sw.shiftId = @shiftId
        AND w.instance = @instance
        AND w.recordDelete_dateTime IS NULL
      ORDER BY
        w.workOrderNumber DESC
    `);
    return result.recordset;
}
