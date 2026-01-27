import type { DateString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateTimesheetForm {
  timesheetId: number | string
  timesheetTypeDataListItemId: number | string
  supervisorEmployeeNumber: string

  timesheetDateString: DateString
  timesheetTitle: string
  timesheetNote: string

  shiftId?: number | string | null
}

export default async function updateTimesheet(
  updateTimesheetForm: UpdateTimesheetForm,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('timesheetId', updateTimesheetForm.timesheetId)
    .input('instance', getConfigProperty('application.instance'))
    .input('timesheetDate', updateTimesheetForm.timesheetDateString)
    .input(
      'timesheetTypeDataListItemId',
      updateTimesheetForm.timesheetTypeDataListItemId
    )
    .input(
      'supervisorEmployeeNumber',
      updateTimesheetForm.supervisorEmployeeNumber
    )
    .input('timesheetTitle', updateTimesheetForm.timesheetTitle)
    .input('timesheetNote', updateTimesheetForm.timesheetNote)
    .input('shiftId', updateTimesheetForm.shiftId ?? undefined)
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.Timesheets
      SET
        supervisorEmployeeNumber = @supervisorEmployeeNumber,
        timesheetTypeDataListItemId = @timesheetTypeDataListItemId,
        timesheetTitle = @timesheetTitle,
        timesheetNote = @timesheetNote,
        timesheetDate = @timesheetDate,
        shiftId = @shiftId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        timesheetId = @timesheetId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
        AND employeesEntered_dateTime IS NULL
        AND equipmentEntered_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
