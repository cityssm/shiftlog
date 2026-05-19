import type { DateString, TimeString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { dateTimeInputToSqlDateTime } from '../../helpers/dateTime.helpers.js'
import { sendNotificationWorkerMessage } from '../../helpers/notification.helpers.js'
import getAssignedToItem from '../assignedTo/getAssignedToItem.js'

import createWorkOrderNote from './createWorkOrderNote.js'

export type UpdateWorkOrderForm = Record<`moreInfo_${string}`, unknown> & {
  workOrderId: number | string

  workOrderTitle: string
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
  requestorIsSubscribed?: '1'
  workOrderIsMuted?: '1'

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
      updateWorkOrderForm.workOrderStatusDataListItemId === undefined ||
        updateWorkOrderForm.workOrderStatusDataListItemId === ''
        ? null
        : updateWorkOrderForm.workOrderStatusDataListItemId
    )
    .input(
      'workOrderPriorityDataListItemId',
      updateWorkOrderForm.workOrderPriorityDataListItemId === undefined ||
        updateWorkOrderForm.workOrderPriorityDataListItemId === ''
        ? null
        : updateWorkOrderForm.workOrderPriorityDataListItemId
    )
    .input('workOrderDetails', updateWorkOrderForm.workOrderDetails)
    .input('workOrderTitle', updateWorkOrderForm.workOrderTitle)
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
      'requestorIsSubscribed',
      updateWorkOrderForm.requestorIsSubscribed === '1'
    )
    .input('workOrderIsMuted', updateWorkOrderForm.workOrderIsMuted === '1')
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
      updateWorkOrderForm.assignedToId === undefined ||
        updateWorkOrderForm.assignedToId === ''
        ? null
        : updateWorkOrderForm.assignedToId
    )
    .input('moreInfoFormDataJson', moreInfoFormDataJson)
    .input('userName', userName)
    .query<{
      deletedAssignedToId: number | null
      insertedAssignedToId: number | null
    }>(/* sql */ `
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
        recordUpdate_dateTime = getdate() OUTPUT deleted.assignedToId AS deletedAssignedToId,
        inserted.assignedToId AS insertedAssignedToId
      WHERE
        workOrderId = @workOrderId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
        AND (
          workOrderTypeId <> @workOrderTypeId
          OR (
            workOrderStatusDataListItemId IS NULL
            AND @workOrderStatusDataListItemId IS NOT NULL
          )
          OR (
            workOrderStatusDataListItemId IS NOT NULL
            AND @workOrderStatusDataListItemId IS NULL
          )
          OR workOrderStatusDataListItemId <> @workOrderStatusDataListItemId
          OR (
            workOrderPriorityDataListItemId IS NULL
            AND @workOrderPriorityDataListItemId IS NOT NULL
          )
          OR (
            workOrderPriorityDataListItemId IS NOT NULL
            AND @workOrderPriorityDataListItemId IS NULL
          )
          OR workOrderPriorityDataListItemId <> @workOrderPriorityDataListItemId
          OR workOrderDetails <> @workOrderDetails
          OR workOrderTitle <> @workOrderTitle
          OR workOrderOpenDateTime <> @workOrderOpenDateTime
          OR (
            workOrderDueDateTime IS NULL
            AND @workOrderDueDateTime IS NOT NULL
          )
          OR (
            workOrderDueDateTime IS NOT NULL
            AND @workOrderDueDateTime IS NULL
          )
          OR workOrderDueDateTime <> @workOrderDueDateTime
          OR (
            workOrderCloseDateTime IS NULL
            AND @workOrderCloseDateTime IS NOT NULL
          )
          OR (
            workOrderCloseDateTime IS NOT NULL
            AND @workOrderCloseDateTime IS NULL
          )
          OR workOrderCloseDateTime <> @workOrderCloseDateTime
          OR requestorName <> @requestorName
          OR requestorContactInfo <> @requestorContactInfo
          OR requestorIsSubscribed <> @requestorIsSubscribed
          OR workOrderIsMuted <> @workOrderIsMuted
          OR (
            locationLatitude IS NULL
            AND @locationLatitude IS NOT NULL
          )
          OR (
            locationLatitude IS NOT NULL
            AND @locationLatitude IS NULL
          )
          OR locationLatitude <> @locationLatitude
          OR (
            locationLongitude IS NULL
            AND @locationLongitude IS NOT NULL
          )
          OR (
            locationLongitude IS NOT NULL
            AND @locationLongitude IS NULL
          )
          OR locationLongitude <> @locationLongitude
          OR locationAddress1 <> @locationAddress1
          OR locationAddress2 <> @locationAddress2
          OR locationCityProvince <> @locationCityProvince
          OR (
            assignedToId IS NULL
            AND @assignedToId IS NOT NULL
          )
          OR (
            assignedToId IS NOT NULL
            AND @assignedToId IS NULL
          )
          OR assignedToId <> @assignedToId
          OR moreInfoFormDataJson <> @moreInfoFormDataJson
        )
    `)

  if (
    result.recordset.length > 0 &&
    result.recordset[0].deletedAssignedToId !==
      result.recordset[0].insertedAssignedToId
  ) {
    if (result.recordset[0].insertedAssignedToId === null) {
      await createWorkOrderNote(
        {
          workOrderId: updateWorkOrderForm.workOrderId,

          noteText: `Unassigned`
        },
        userName
      )
    } else {
      const assignedTo = await getAssignedToItem(
        result.recordset[0].insertedAssignedToId
      )

      await createWorkOrderNote(
        {
          workOrderId: updateWorkOrderForm.workOrderId,

          noteText: `Assigned to "${assignedTo?.assignedToName ?? 'Unknown'}"`
        },
        userName
      )
    }
  }

  if (
    result.rowsAffected[0] > 0 &&
    updateWorkOrderForm.workOrderIsMuted !== '1'
  ) {
    // Send Notification
    sendNotificationWorkerMessage(
      'workOrder.update',
      typeof updateWorkOrderForm.workOrderId === 'string'
        ? Number.parseInt(updateWorkOrderForm.workOrderId, 10)
        : updateWorkOrderForm.workOrderId
    )
  }

  return true
}
