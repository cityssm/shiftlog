// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, unicorn/no-null */
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { dateTimeInputToSqlDateTime } from '../../helpers/dateTime.helpers.js';
export default async function createWorkOrder(createWorkOrderForm, userName) {
    const pool = await getShiftLogConnectionPool();
    const openDateTime = new Date(createWorkOrderForm.workOrderOpenDateTimeString);
    const currentYear = openDateTime.getFullYear();
    // Get the next sequence number for the current year
    const sequenceResult = (await pool
        .request()
        .input('year', currentYear)
        .input('workOrderNumberPrefix', getConfigProperty('workOrders.workOrderNumberPrefix')).query(/* sql */ `
      select isnull(max(workOrderNumberSequence), 0) + 1 as nextSequence
      from ShiftLog.WorkOrders
      where workOrderNumberYear = @year
        and workOrderNumberPrefix = @workOrderNumberPrefix
    `));
    const nextSequence = sequenceResult.recordset[0].nextSequence;
    const result = (await pool
        .request()
        .input('workOrderNumberPrefix', getConfigProperty('workOrders.workOrderNumberPrefix'))
        .input('workOrderNumberYear', currentYear)
        .input('workOrderNumberSequence', nextSequence)
        .input('workOrderTypeDataListItemId', createWorkOrderForm.workOrderTypeDataListItemId)
        .input('workOrderStatusDataListItemId', createWorkOrderForm.workOrderStatusDataListItemId === ''
        ? null
        : createWorkOrderForm.workOrderStatusDataListItemId)
        .input('workOrderDetails', createWorkOrderForm.workOrderDetails)
        .input('workOrderOpenDateTime', dateTimeInputToSqlDateTime(createWorkOrderForm.workOrderOpenDateTimeString))
        .input('workOrderDueDateTime', createWorkOrderForm.workOrderDueDateTimeString === ''
        ? null
        : dateTimeInputToSqlDateTime(createWorkOrderForm.workOrderDueDateTimeString))
        .input('workOrderCloseDateTime', createWorkOrderForm.workOrderCloseDateTimeString
        ? dateTimeInputToSqlDateTime(createWorkOrderForm.workOrderCloseDateTimeString)
        : null)
        .input('requestorName', createWorkOrderForm.requestorName)
        .input('requestorContactInfo', createWorkOrderForm.requestorContactInfo)
        .input('locationLatitude', createWorkOrderForm.locationLatitude ?? null)
        .input('locationLongitude', createWorkOrderForm.locationLongitude ?? null)
        .input('locationAddress1', createWorkOrderForm.locationAddress1)
        .input('locationAddress2', createWorkOrderForm.locationAddress2)
        .input('locationCityProvince', createWorkOrderForm.locationCityProvince)
        .input('assignedToDataListItemId', createWorkOrderForm.assignedToDataListItemId ?? null)
        .input('userName', userName).query(/* sql */ `
      insert into ShiftLog.WorkOrders (
        workOrderNumberPrefix,
        workOrderNumberYear,
        workOrderNumberSequence,
        workOrderTypeDataListItemId,
        workOrderStatusDataListItemId,
        workOrderDetails,
        workOrderOpenDateTime,
        workOrderDueDateTime,
        workOrderCloseDateTime,
        requestorName,
        requestorContactInfo,
        locationLatitude,
        locationLongitude,
        locationAddress1,
        locationAddress2,
        locationCityProvince,
        assignedToDataListItemId,
        recordCreate_userName,
        recordUpdate_userName
      )
      output inserted.workOrderId
      values (
        @workOrderNumberPrefix,
        @workOrderNumberYear,
        @workOrderNumberSequence,
        @workOrderTypeDataListItemId,
        @workOrderStatusDataListItemId,
        @workOrderDetails,
        @workOrderOpenDateTime,
        @workOrderDueDateTime,
        @workOrderCloseDateTime,
        @requestorName,
        @requestorContactInfo,
        @locationLatitude,
        @locationLongitude,
        @locationAddress1,
        @locationAddress2,
        @locationCityProvince,
        @assignedToDataListItemId,
        @userName,
        @userName
      )
    `));
    return result.recordset[0].workOrderId;
}
