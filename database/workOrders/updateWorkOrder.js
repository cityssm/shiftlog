// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, unicorn/no-null */
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { dateTimeInputToSqlDateTime } from '../../helpers/dateTime.helpers.js';
export default async function updateWorkOrder(updateWorkOrderForm, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('workOrderId', updateWorkOrderForm.workOrderId)
        .input('workOrderTypeDataListItemId', updateWorkOrderForm.workOrderTypeDataListItemId)
        .input('workOrderStatusDataListItemId', updateWorkOrderForm.workOrderStatusDataListItemId === ''
        ? null
        : updateWorkOrderForm.workOrderStatusDataListItemId)
        .input('workOrderDetails', updateWorkOrderForm.workOrderDetails)
        .input('workOrderOpenDateTime', dateTimeInputToSqlDateTime(updateWorkOrderForm.workOrderOpenDateTimeString))
        .input('workOrderDueDateTime', updateWorkOrderForm.workOrderDueDateTimeString === ''
        ? null
        : dateTimeInputToSqlDateTime(updateWorkOrderForm.workOrderDueDateTimeString))
        .input('workOrderCloseDateTime', updateWorkOrderForm.workOrderCloseDateTimeString === ''
        ? null
        : dateTimeInputToSqlDateTime(updateWorkOrderForm.workOrderCloseDateTimeString))
        .input('requestorName', updateWorkOrderForm.requestorName)
        .input('requestorContactInfo', updateWorkOrderForm.requestorContactInfo)
        .input('locationLatitude', updateWorkOrderForm.locationLatitude ?? null)
        .input('locationLongitude', updateWorkOrderForm.locationLongitude ?? null)
        .input('locationAddress1', updateWorkOrderForm.locationAddress1)
        .input('locationAddress2', updateWorkOrderForm.locationAddress2)
        .input('locationCityProvince', updateWorkOrderForm.locationCityProvince)
        .input('assignedToDataListItemId', updateWorkOrderForm.assignedToDataListItemId ?? null)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrders
      set
        workOrderTypeDataListItemId = @workOrderTypeDataListItemId,
        workOrderStatusDataListItemId = @workOrderStatusDataListItemId,
        workOrderDetails = @workOrderDetails,
        workOrderOpenDateTime = @workOrderOpenDateTime,
        workOrderDueDateTime = @workOrderDueDateTime,
        workOrderCloseDateTime = @workOrderCloseDateTime,
        requestorName = @requestorName,
        requestorContactInfo = @requestorContactInfo,
        locationLatitude = @locationLatitude,
        locationLongitude = @locationLongitude,
        locationAddress1 = @locationAddress1,
        locationAddress2 = @locationAddress2,
        locationCityProvince = @locationCityProvince,
        assignedToDataListItemId = @assignedToDataListItemId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where workOrderId = @workOrderId
        and recordDelete_dateTime is null
    `));
    return result.rowsAffected[0] > 0;
}
