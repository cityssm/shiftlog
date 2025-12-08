// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */

import type { mssql } from '@cityssm/mssql-multi-pool'
import type { DateString, TimeString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { dateTimeInputToSqlDateTime } from '../../helpers/dateTime.helpers.js'
import getWorkOrderType from '../workOrderTypes/getWorkOrderType.js'
import getWorkOrderTypeDefaultMilestones from '../workOrderTypes/getWorkOrderTypeDefaultMilestones.js'

export interface CreateWorkOrderForm {
  workOrderDetails: string
  workOrderStatusDataListItemId?: number | string
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

  requestorName: string
  requestorContactInfo: string

  locationLatitude?: number | string
  locationLongitude?: number | string

  locationAddress1: string
  locationAddress2: string
  locationCityProvince: string

  assignedToDataListItemId?: number | string
}

export default async function createWorkOrder(
  createWorkOrderForm: CreateWorkOrderForm,
  user: User
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const workOrderTypeId =
    typeof createWorkOrderForm.workOrderTypeId === 'string'
      ? Number.parseInt(createWorkOrderForm.workOrderTypeId, 10)
      : createWorkOrderForm.workOrderTypeId

  const workOrderType = await getWorkOrderType(workOrderTypeId, user)

  if (workOrderType === undefined) {
    throw new Error('Invalid work order type.')
  }

  const openDateTime = new Date(createWorkOrderForm.workOrderOpenDateTimeString)
  const currentYear = openDateTime.getFullYear()

  // Calculate due date if not provided and dueDays is set
  let calculatedDueDateTime: Date | null = null
  if (
    createWorkOrderForm.workOrderDueDateTimeString === '' &&
    workOrderType.dueDays !== null &&
    workOrderType.dueDays !== undefined &&
    workOrderType.dueDays > 0
  ) {
    calculatedDueDateTime = new Date(openDateTime)
    calculatedDueDateTime.setDate(
      calculatedDueDateTime.getDate() + workOrderType.dueDays
    )
  }

  // Get the next sequence number for the current year and work order type
  const sequenceResult = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('year', currentYear)
    .input('workOrderNumberPrefix', workOrderType.workOrderNumberPrefix)
    .query(/* sql */ `
      select isnull(max(workOrderNumberSequence), 0) + 1 as nextSequence
      from ShiftLog.WorkOrders
      where
        instance = @instance
        and workOrderNumberPrefix = @workOrderNumberPrefix
        and workOrderNumberYear = @year
    `)) as mssql.IResult<{ nextSequence: number }>

  const nextSequence = sequenceResult.recordset[0].nextSequence

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderNumberPrefix', workOrderType.workOrderNumberPrefix)
    .input('workOrderNumberYear', currentYear)
    .input('workOrderNumberSequence', nextSequence)
    .input('workOrderTypeId', createWorkOrderForm.workOrderTypeId)
    .input(
      'workOrderStatusDataListItemId',
      createWorkOrderForm.workOrderStatusDataListItemId === ''
        ? null
        : createWorkOrderForm.workOrderStatusDataListItemId
    )
    .input('workOrderDetails', createWorkOrderForm.workOrderDetails)
    .input(
      'workOrderOpenDateTime',
      dateTimeInputToSqlDateTime(
        createWorkOrderForm.workOrderOpenDateTimeString
      )
    )
    .input(
      'workOrderDueDateTime',
      createWorkOrderForm.workOrderDueDateTimeString === ''
        ? calculatedDueDateTime
        : dateTimeInputToSqlDateTime(
            createWorkOrderForm.workOrderDueDateTimeString
          )
    )
    .input(
      'workOrderCloseDateTime',
      createWorkOrderForm.workOrderCloseDateTimeString
        ? dateTimeInputToSqlDateTime(
            createWorkOrderForm.workOrderCloseDateTimeString
          )
        : null
    )
    .input('requestorName', createWorkOrderForm.requestorName)
    .input('requestorContactInfo', createWorkOrderForm.requestorContactInfo)
    .input(
      'locationLatitude',
      (createWorkOrderForm.locationLatitude ?? '') === ''
        ? null
        : createWorkOrderForm.locationLatitude
    )
    .input(
      'locationLongitude',
      (createWorkOrderForm.locationLongitude ?? '') === ''
        ? null
        : createWorkOrderForm.locationLongitude
    )
    .input('locationAddress1', createWorkOrderForm.locationAddress1)
    .input('locationAddress2', createWorkOrderForm.locationAddress2)
    .input('locationCityProvince', createWorkOrderForm.locationCityProvince)
    .input(
      'assignedToDataListItemId',
      createWorkOrderForm.assignedToDataListItemId === ''
        ? null
        : createWorkOrderForm.assignedToDataListItemId
    )
    .input('userName', user.userName).query(/* sql */ `
      insert into ShiftLog.WorkOrders (
        instance,
        workOrderNumberPrefix,
        workOrderNumberYear,
        workOrderNumberSequence,
        workOrderTypeId,
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
        @instance,
        @workOrderNumberPrefix,
        @workOrderNumberYear,
        @workOrderNumberSequence,
        @workOrderTypeId,
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
    `)) as mssql.IResult<{ workOrderId: number }>

  const workOrderId = result.recordset[0].workOrderId

  // Create default milestones for this work order
  const defaultMilestones =
    await getWorkOrderTypeDefaultMilestones(workOrderTypeId)

  for (const defaultMilestone of defaultMilestones) {
    // Calculate milestone due date if dueDays is set
    let milestoneDueDateTime: Date | null = null
    if (
      defaultMilestone.dueDays !== null &&
      defaultMilestone.dueDays !== undefined &&
      defaultMilestone.dueDays > 0
    ) {
      milestoneDueDateTime = new Date(openDateTime)
      milestoneDueDateTime.setDate(
        milestoneDueDateTime.getDate() + defaultMilestone.dueDays
      )
    }

    await pool
      .request()
      .input('workOrderId', workOrderId)
      .input('milestoneTitle', defaultMilestone.milestoneTitle)
      .input('milestoneDescription', defaultMilestone.milestoneDescription)
      .input('milestoneDueDateTime', milestoneDueDateTime)
      .input('orderNumber', defaultMilestone.orderNumber)
      .input('userName', user.userName).query(/* sql */ `
        insert into ShiftLog.WorkOrderMilestones (
          workOrderId,
          milestoneTitle,
          milestoneDescription,
          milestoneDueDateTime,
          orderNumber,
          recordCreate_userName,
          recordUpdate_userName
        )
        values (
          @workOrderId,
          @milestoneTitle,
          @milestoneDescription,
          @milestoneDueDateTime,
          @orderNumber,
          @userName,
          @userName
        )
      `)
  }

  return workOrderId
}
