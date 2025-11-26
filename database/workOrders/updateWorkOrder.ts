// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, unicorn/no-null */

import type { DateString, TimeString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { dateTimeInputToSqlDateTime } from '../../helpers/dateTime.helpers.js'

export interface UpdateWorkOrderForm {
  workOrderId: number | string

  workOrderDetails: string
  workOrderStatusDataListItemId?: number | string
  workOrderTypeDataListItemId: number | string

  workOrderOpenDateTimeString:
    | `${DateString} ${TimeString}`
    | `${DateString}T${TimeString}`

  workOrderDueDateTimeString:
    | ''
    | `${DateString} ${TimeString}`
    | `${DateString}T${TimeString}`

  workOrderCloseDateTimeString:
    | ''
    | `${DateString} ${TimeString}`
    | `${DateString}T${TimeString}`

  requestorContactInfo: string
  requestorName: string

  locationLatitude?: number | string
  locationLongitude?: number | string

  locationAddress1: string
  locationAddress2: string
  locationCityProvince: string

  assignedToDataListItemId?: number | string
}

export default async function updateWorkOrder(
  updateWorkOrderForm: UpdateWorkOrderForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderId', updateWorkOrderForm.workOrderId)
    .input(
      'workOrderTypeDataListItemId',
      updateWorkOrderForm.workOrderTypeDataListItemId
    )
    .input(
      'workOrderStatusDataListItemId',
      updateWorkOrderForm.workOrderStatusDataListItemId === ''
        ? null
        : updateWorkOrderForm.workOrderStatusDataListItemId
    )
    .input('workOrderDetails', updateWorkOrderForm.workOrderDetails)
    .input(
      'workOrderOpenDateTime',
      dateTimeInputToSqlDateTime(
        updateWorkOrderForm.workOrderOpenDateTimeString
      )
    )
    .input(
      'workOrderDueDateTime',
      updateWorkOrderForm.workOrderDueDateTimeString === ''
        ? null
        : dateTimeInputToSqlDateTime(
            updateWorkOrderForm.workOrderDueDateTimeString
          )
    )
    .input(
      'workOrderCloseDateTime',
      updateWorkOrderForm.workOrderCloseDateTimeString === ''
        ? null
        : dateTimeInputToSqlDateTime(
            updateWorkOrderForm.workOrderCloseDateTimeString
          )
    )
    .input('requestorName', updateWorkOrderForm.requestorName)
    .input('requestorContactInfo', updateWorkOrderForm.requestorContactInfo)
    .input(
      'locationLatitude',
      (updateWorkOrderForm.locationLatitude ?? '') === ''
        ? null
        : updateWorkOrderForm.locationLatitude
    )
    .input(
      'locationLongitude',
      (updateWorkOrderForm.locationLongitude ?? '') === ''
        ? null
        : updateWorkOrderForm.locationLongitude
    )
    .input('locationAddress1', updateWorkOrderForm.locationAddress1)
    .input('locationAddress2', updateWorkOrderForm.locationAddress2)
    .input('locationCityProvince', updateWorkOrderForm.locationCityProvince)
    .input(
      'assignedToDataListItemId',
      updateWorkOrderForm.assignedToDataListItemId ?? null
    )
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
        and instance = @instance
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
