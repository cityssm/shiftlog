import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrder(workOrderId, user) {
    const pool = await getShiftLogConnectionPool();
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

    ${user === undefined
        ? ''
        : `
            and (
              wType.userGroupId is null or wType.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
          `}    
  `;
    try {
        const workOrdersResult = (await pool
            .request()
            .input('workOrderId', workOrderId)
            .input('instance', getConfigProperty('application.instance'))
            .input('userName', user?.userName)
            .query(sql));
        if (workOrdersResult.recordset.length === 0) {
            return undefined;
        }
        const workOrder = workOrdersResult.recordset[0];
        if (workOrder.moreInfoFormDataJson === undefined) {
            workOrder.moreInfoFormData = {};
        }
        else {
            try {
                workOrder.moreInfoFormData = JSON.parse(workOrder.moreInfoFormDataJson);
            }
            catch {
                workOrder.moreInfoFormData = {};
            }
        }
        return workOrder;
    }
    catch {
        return undefined;
    }
}
