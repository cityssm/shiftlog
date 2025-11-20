import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateWorkOrderForm {
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

export default async function createWorkOrder(
  createWorkOrderForm: CreateWorkOrderForm,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const openDateTime = new Date(createWorkOrderForm.workOrderOpenDateTimeString)
  const currentYear = openDateTime.getFullYear()

  // Get the next sequence number for the current year
  const sequenceResult = (await pool.request().input('year', currentYear)
    .query(/* sql */ `
      select isnull(max(workOrderNumberSequence), 0) + 1 as nextSequence
      from ShiftLog.WorkOrders
      where workOrderNumberYear = @year
    `)) as mssql.IResult<{ nextSequence: number }>

  const nextSequence = sequenceResult.recordset[0].nextSequence

  const result = (await pool
    .request()
    .input('workOrderNumberYear', currentYear)
    .input('workOrderNumberSequence', nextSequence)
    .input('workOrderTypeDataListItemId', createWorkOrderForm.workOrderTypeDataListItemId)
    .input('workOrderStatusDataListItemId', createWorkOrderForm.workOrderStatusDataListItemId ?? null)
    .input('workOrderDetails', createWorkOrderForm.workOrderDetails)
    .input('workOrderOpenDateTime', createWorkOrderForm.workOrderOpenDateTimeString)
    .input('workOrderDueDateTime', createWorkOrderForm.workOrderDueDateTimeString ?? null)
    .input('workOrderCloseDateTime', createWorkOrderForm.workOrderCloseDateTimeString ?? null)
    .input('requestorName', createWorkOrderForm.requestorName)
    .input('requestorContactInfo', createWorkOrderForm.requestorContactInfo)
    .input('locationLatitude', createWorkOrderForm.locationLatitude ?? null)
    .input('locationLongitude', createWorkOrderForm.locationLongitude ?? null)
    .input('locationAddress1', createWorkOrderForm.locationAddress1)
    .input('locationAddress2', createWorkOrderForm.locationAddress2)
    .input('locationCityProvince', createWorkOrderForm.locationCityProvince)
    .input('assignedToDataListItemId', createWorkOrderForm.assignedToDataListItemId ?? null)
    .input('userGroupId', createWorkOrderForm.userGroupId ?? null)
    .input('userName', userName).query(/* sql */ `
      insert into ShiftLog.WorkOrders (
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
        userGroupId,
        recordCreate_userName,
        recordUpdate_userName
      )
      output inserted.workOrderId
      values (
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
        @userGroupId,
        @userName,
        @userName
      )
    `)) as mssql.IResult<{ workOrderId: number }>

  return result.recordset[0].workOrderId
}
