import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShiftWorkOrders(shiftId) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('instance', getConfigProperty('application.instance')).query(
    /* sql */ `
        select
          w.workOrderId,
          w.workOrderNumberPrefix,
          w.workOrderNumberYear,
          w.workOrderNumberSequence,
          w.workOrderNumberOverride,
          w.workOrderNumber,
          w.workOrderTypeId,
          wt.workOrderType,
          w.workOrderStatusDataListItemId,
          wsd.dataListItem as workOrderStatusDataListItem,
          w.workOrderPriorityDataListItemId,
          wpd.dataListItem as workOrderPriorityDataListItem,
          w.workOrderDetails,
          w.workOrderOpenDateTime,
          w.workOrderDueDateTime,
          w.workOrderCloseDateTime,
          w.requestorName,
          w.requestorContactInfo,
          w.assignedToDataListItemId,
          atd.dataListItem as assignedToDataListItem,
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
        from ShiftLog.ShiftWorkOrders sw
        inner join ShiftLog.WorkOrders w on sw.workOrderId = w.workOrderId
        inner join ShiftLog.WorkOrderTypes wt on w.workOrderTypeId = wt.workOrderTypeId
        left join ShiftLog.DataListItems wsd on w.workOrderStatusDataListItemId = wsd.dataListItemId
        left join ShiftLog.DataListItems wpd on w.workOrderPriorityDataListItemId = wpd.dataListItemId
        left join ShiftLog.DataListItems atd on w.assignedToDataListItemId = atd.dataListItemId
        where sw.shiftId = @shiftId
          and w.instance = @instance
          and w.recordDelete_dateTime is null
        order by w.workOrderNumber desc
      `));
    return result.recordset;
}
