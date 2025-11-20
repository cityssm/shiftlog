import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateWorkOrderForm {
  workOrderId: number | string
  workOrderTypeDataListItemId: number | string
  workOrderStatusDataListItemId?: number | string | null
  workOrderDetails: string

  workOrderOpenDateTimeString: string
  workOrderDueDateTimeString?: string
  workOrderCloseDateTimeString?: string

  requestorName: string
  requestorContactInfo: string

  locationLatitude?: number | string | null
  locationLongitude?: number | string | null
  locationAddress1: string
  locationAddress2: string
  locationCityProvince: string

  assignedToDataListItemId?: number | string | null
  userGroupId?: number | string | null
}

export default async function updateWorkOrder(
  updateWorkOrderForm: UpdateWorkOrderForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('workOrderId', updateWorkOrderForm.workOrderId)
    .input('workOrderTypeDataListItemId', updateWorkOrderForm.workOrderTypeDataListItemId)
    .input('workOrderStatusDataListItemId', updateWorkOrderForm.workOrderStatusDataListItemId ?? null)
    .input('workOrderDetails', updateWorkOrderForm.workOrderDetails)
    .input('workOrderOpenDateTime', updateWorkOrderForm.workOrderOpenDateTimeString)
    .input('workOrderDueDateTime', updateWorkOrderForm.workOrderDueDateTimeString ?? null)
    .input('workOrderCloseDateTime', updateWorkOrderForm.workOrderCloseDateTimeString ?? null)
    .input('requestorName', updateWorkOrderForm.requestorName)
    .input('requestorContactInfo', updateWorkOrderForm.requestorContactInfo)
    .input('locationLatitude', updateWorkOrderForm.locationLatitude ?? null)
    .input('locationLongitude', updateWorkOrderForm.locationLongitude ?? null)
    .input('locationAddress1', updateWorkOrderForm.locationAddress1)
    .input('locationAddress2', updateWorkOrderForm.locationAddress2)
    .input('locationCityProvince', updateWorkOrderForm.locationCityProvince)
    .input('assignedToDataListItemId', updateWorkOrderForm.assignedToDataListItemId ?? null)
    .input('userGroupId', updateWorkOrderForm.userGroupId ?? null)
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
        userGroupId = @userGroupId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where workOrderId = @workOrderId
        and recordDelete_dateTime is null
    `)) as mssql.IResult<Record<string, never>>

  return result.rowsAffected[0] > 0
}
