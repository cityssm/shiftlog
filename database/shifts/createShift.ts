import type { mssql } from '@cityssm/mssql-multi-pool'
import type { DateString } from '@cityssm/utils-datetime'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateShiftForm {
  shiftTypeDataListItemId: number | string
  supervisorEmployeeNumber: string

  shiftDateString: DateString
  shiftTimeDataListItemId: number | string

  shiftDescription: string
}

export default async function createShift(
  createShiftForm: CreateShiftForm,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('shiftDate', createShiftForm.shiftDateString)
    .input('shiftTimeDataListItemId', createShiftForm.shiftTimeDataListItemId)
    .input('shiftTypeDataListItemId', createShiftForm.shiftTypeDataListItemId)
    .input('supervisorEmployeeNumber', createShiftForm.supervisorEmployeeNumber)
    .input('shiftDescription', createShiftForm.shiftDescription)
    .input('userName', userName).query(/* sql */ `
      insert into ShiftLog.Shifts (
        shiftTypeDataListItemId,
        supervisorEmployeeNumber,
        shiftDate,
        shiftTimeDataListItemId,
        shiftDescription,
        recordCreate_userName, recordUpdate_userName
      )
      output inserted.shiftId
      values (
        @shiftTypeDataListItemId,
        @supervisorEmployeeNumber,
        @shiftDate,
        @shiftTimeDataListItemId,
        @shiftDescription,
        @userName, @userName
      )
    `)) as mssql.IResult<{ shiftId: number }>

  return result.recordset[0].shiftId
}
