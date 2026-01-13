// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */

import type { DateString, TimeString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { dateTimeInputToSqlDateTime } from '../../helpers/dateTime.helpers.js'

export type UpdateWorkOrderForm = Record<`moreInfo_${string}`, unknown> & {
  workOrderId: number | string

  workOrderDetails: string
  workOrderStatusDataListItemId?: number | string
  workOrderPriorityDataListItemId?: number | string
  workOrderTypeId: number | string

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

  assignedToId?: number | string
}

function buildMoreInfoFormDataJson(
  updateWorkOrderForm: UpdateWorkOrderForm
): string {
  const moreInfoFormData: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(updateWorkOrderForm)) {
    if (key.startsWith('moreInfo_')) {
      moreInfoFormData[key] = value
    }
  }

  if (Object.keys(moreInfoFormData).length === 0) {
    return '{}'
  }

  return JSON.stringify(moreInfoFormData)
}

export default async function updateWorkOrder(
  updateWorkOrderForm: UpdateWorkOrderForm,
  userName: string
): Promise<boolean> {
  const moreInfoFormDataJson = buildMoreInfoFormDataJson(updateWorkOrderForm)

  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderId', updateWorkOrderForm.workOrderId)
    .input('workOrderTypeId', updateWorkOrderForm.workOrderTypeId)
    .input(
      'workOrderStatusDataListItemId',
      updateWorkOrderForm.workOrderStatusDataListItemId === ''
        ? null
        : updateWorkOrderForm.workOrderStatusDataListItemId
    )
    .input(
      'workOrderPriorityDataListItemId',
      updateWorkOrderForm.workOrderPriorityDataListItemId === ''
        ? null
        : updateWorkOrderForm.workOrderPriorityDataListItemId
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
      'assignedToId',
      updateWorkOrderForm.assignedToId === ''
        ? null
        : updateWorkOrderForm.assignedToId
    )
    .input('moreInfoFormDataJson', moreInfoFormDataJson)
    .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrders
      set
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
      where workOrderId = @workOrderId
        and instance = @instance
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
