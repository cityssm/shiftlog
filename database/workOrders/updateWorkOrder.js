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
        .input('workOrderTitle', updateWorkOrderForm.workOrderTitle)
        .input('workOrderOpenDateTime', dateTimeInputToSqlDateTime(updateWorkOrderForm.workOrderOpenDateTimeString))
        .input('workOrderDueDateTime', updateWorkOrderForm.workOrderDueDateTimeString === ''
        ? null
        : dateTimeInputToSqlDateTime(updateWorkOrderForm.workOrderDueDateTimeString))
        .input('workOrderCloseDateTime', updateWorkOrderForm.workOrderCloseDateTimeString === ''
        ? null
        : dateTimeInputToSqlDateTime(updateWorkOrderForm.workOrderCloseDateTimeString))
        .input('requestorName', updateWorkOrderForm.requestorName)
        .input('requestorContactInfo', updateWorkOrderForm.requestorContactInfo)
        .input('requestorIsSubscribed', updateWorkOrderForm.requestorIsSubscribed === '1')
        .input('workOrderIsMuted', updateWorkOrderForm.workOrderIsMuted === '1')
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
        .query(`
      UPDATE ShiftLog.WorkOrders
      SET
        workOrderTypeId = @workOrderTypeId,
        workOrderStatusDataListItemId = @workOrderStatusDataListItemId,
        workOrderPriorityDataListItemId = @workOrderPriorityDataListItemId,
        workOrderDetails = @workOrderDetails,
        workOrderTitle = @workOrderTitle,
        workOrderOpenDateTime = @workOrderOpenDateTime,
        workOrderDueDateTime = @workOrderDueDateTime,
        workOrderCloseDateTime = @workOrderCloseDateTime,
        requestorName = @requestorName,
        requestorContactInfo = @requestorContactInfo,
        requestorIsSubscribed = @requestorIsSubscribed,
        workOrderIsMuted = @workOrderIsMuted,
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
        AND (
          workOrderTypeId <> @workOrderTypeId
          OR workOrderStatusDataListItemId <> @workOrderStatusDataListItemId
          OR workOrderPriorityDataListItemId <> @workOrderPriorityDataListItemId
          OR workOrderDetails <> @workOrderDetails
          OR workOrderTitle <> @workOrderTitle
          OR workOrderOpenDateTime <> @workOrderOpenDateTime
          OR (workOrderDueDateTime is null and @workOrderDueDateTime is not null) OR (workOrderDueDateTime is not null and @workOrderDueDateTime is null) OR workOrderDueDateTime <> @workOrderDueDateTime
          OR (workOrderCloseDateTime is null and @workOrderCloseDateTime is not null) OR (workOrderCloseDateTime is not null and @workOrderCloseDateTime is null) OR workOrderCloseDateTime <> @workOrderCloseDateTime
          OR requestorName <> @requestorName
          OR requestorContactInfo <> @requestorContactInfo
          OR requestorIsSubscribed <> @requestorIsSubscribed
          OR workOrderIsMuted <> @workOrderIsMuted
          OR locationLatitude <> @locationLatitude
          OR locationLongitude <> @locationLongitude
          OR locationAddress1 <> @locationAddress1
          OR locationAddress2 <> @locationAddress2
          OR locationCityProvince <> @locationCityProvince
          OR assignedToId <> @assignedToId
          OR moreInfoFormDataJson <> @moreInfoFormDataJson
        )
    `);
    if (result.rowsAffected[0] > 0 &&
        updateWorkOrderForm.workOrderIsMuted !== '1') {
        sendNotificationWorkerMessage('workOrder.update', typeof updateWorkOrderForm.workOrderId === 'string'
            ? Number.parseInt(updateWorkOrderForm.workOrderId, 10)
            : updateWorkOrderForm.workOrderId);
    }
    return true;
}
