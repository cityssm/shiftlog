import type { DateString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
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

  let recordLockDate = new Date(createShiftForm.shiftDateString)

  if (recordLockDate < new Date()) {
    recordLockDate = new Date()
  }

  recordLockDate.setDate(recordLockDate.getDate() + 7)

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('shiftDate', createShiftForm.shiftDateString)
    .input('shiftTimeDataListItemId', createShiftForm.shiftTimeDataListItemId)
    .input('shiftTypeDataListItemId', createShiftForm.shiftTypeDataListItemId)
    .input('supervisorEmployeeNumber', createShiftForm.supervisorEmployeeNumber)
    .input('shiftDescription', createShiftForm.shiftDescription)
    .input('userName', userName)
    .input('recordLockDate', recordLockDate)
    .query<{ shiftId: number }>(/* sql */ `
      INSERT INTO
        ShiftLog.Shifts (
          instance,
          shiftTypeDataListItemId,
          supervisorEmployeeNumber,
          shiftDate,
          shiftTimeDataListItemId,
          shiftDescription,
          recordCreate_userName,
          recordUpdate_userName,
          recordLock_dateTime
        ) output inserted.shiftId
      VALUES
        (
          @instance,
          @shiftTypeDataListItemId,
          @supervisorEmployeeNumber,
          @shiftDate,
          @shiftTimeDataListItemId,
          @shiftDescription,
          @userName,
          @userName,
          @recordLockDate
        )
    `)

  return result.recordset[0].shiftId
}
