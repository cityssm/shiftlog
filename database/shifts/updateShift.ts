import type { mssql } from '@cityssm/mssql-multi-pool'
import type { DateString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateShiftForm {
  shiftId: number | string

  shiftTypeDataListItemId: number | string
  supervisorEmployeeNumber: string

  shiftDateString: DateString
  shiftTimeDataListItemId: number | string

  shiftDescription: string
}

export default async function updateShift(
  updateShiftForm: UpdateShiftForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  let recordLockDate = new Date(updateShiftForm.shiftDateString)

  if (recordLockDate < new Date()) {
    recordLockDate = new Date()
  }

  recordLockDate.setDate(recordLockDate.getDate() + 7)

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('shiftTypeDataListItemId', updateShiftForm.shiftTypeDataListItemId)
    .input('supervisorEmployeeNumber', updateShiftForm.supervisorEmployeeNumber)
    .input('shiftDate', updateShiftForm.shiftDateString)
    .input('shiftTimeDataListItemId', updateShiftForm.shiftTimeDataListItemId)
    .input('shiftDescription', updateShiftForm.shiftDescription)
    .input('userName', userName)
    .input('recordLockDate', recordLockDate)
    .input('shiftId', updateShiftForm.shiftId)
    .query(/* sql */ `
      UPDATE ShiftLog.Shifts
      SET
        shiftTypeDataListItemId = @shiftTypeDataListItemId,
        supervisorEmployeeNumber = @supervisorEmployeeNumber,
        shiftDate = @shiftDate,
        shiftTimeDataListItemId = @shiftTimeDataListItemId,
        shiftDescription = @shiftDescription,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getutcdate(),
        recordLock_dateTime = @recordLockDate
      WHERE
        shiftId = @shiftId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `)) as mssql.IResult<{ shiftId: number }>

  return result.rowsAffected[0] > 0
}
