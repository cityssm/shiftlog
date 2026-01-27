import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { dateTimeInputToSqlDateTime } from '../../helpers/dateTime.helpers.js';
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js';
function buildMoreInfoFormDataJson(updateWorkOrderForm) {
    const moreInfoFormData = {};
    for (const [key, value] of Object.entries(updateWorkOrderForm)) {
        if (key.startsWith('moreInfo_')) {
            moreInfoFormData[key] = value;
        }
    }
    if (Object.keys(moreInfoFormData).length === 0) {
        return '{}';
    }
    return JSON.stringify(moreInfoFormData);
}
export default async function updateWorkOrder(updateWorkOrderForm, userName) {
    const moreInfoFormDataJson = buildMoreInfoFormDataJson(updateWorkOrderForm);
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderId', updateWorkOrderForm.workOrderId)
        .input('workOrderTypeId', updateWorkOrderForm.workOrderTypeId)
        .input('workOrderStatusDataListItemId', updateWorkOrderForm.workOrderStatusDataListItemId === ''
        ? null
        : updateWorkOrderForm.workOrderStatusDataListItemId)
        .input('workOrderPriorityDataListItemId', updateWorkOrderForm.workOrderPriorityDataListItemId === ''
        ? null
        : updateWorkOrderForm.workOrderPriorityDataListItemId)
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
        .input('locationLatitude', (updateWorkOrderForm.locationLatitude ?? '') === ''
        ? null
        : updateWorkOrderForm.locationLatitude)
        .input('locationLongitude', (updateWorkOrderForm.locationLongitude ?? '') === ''
        ? null
        : updateWorkOrderForm.locationLongitude)
        .input('locationAddress1', updateWorkOrderForm.locationAddress1)
        .input('locationAddress2', updateWorkOrderForm.locationAddress2)
        .input('locationCityProvince', updateWorkOrderForm.locationCityProvince)
        .input('assignedToId', updateWorkOrderForm.assignedToId === ''
        ? null
        : updateWorkOrderForm.assignedToId)
        .input('moreInfoFormDataJson', moreInfoFormDataJson)
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.WorkOrders
      SET
        workOrderTypeId = @workOrderTypeId,
        workOrderStatusDataListItemId = @workOrderStatusDataListItemId,
        workOrderPriorityDataListItemId = @workOrderPriorityDataListItemId,
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
        assignedToId = @assignedToId,
        moreInfoFormDataJson = @moreInfoFormDataJson,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        workOrderId = @workOrderId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `);
    if (result.rowsAffected[0] > 0) {
        // Send Notification
        sendNotificationWorkerMessage('workOrder.update', typeof updateWorkOrderForm.workOrderId === 'string'
            ? Number.parseInt(updateWorkOrderForm.workOrderId, 10)
            : updateWorkOrderForm.workOrderId);
    }
    return result.rowsAffected[0] > 0;
}
