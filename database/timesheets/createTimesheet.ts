import type { mssql } from '@cityssm/mssql-multi-pool'
import type { DateString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface CreateTimesheetForm {
  timesheetTypeDataListItemId: number | string
  supervisorEmployeeNumber: string

  timesheetDateString: DateString
  timesheetTitle: string
  timesheetNote: string

  shiftId?: number | string | null
}

export default async function createTimesheet(
  createTimesheetForm: CreateTimesheetForm,
  userName: string
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('timesheetDate', createTimesheetForm.timesheetDateString)
    .input(
      'timesheetTypeDataListItemId',
      createTimesheetForm.timesheetTypeDataListItemId
    )
    .input(
      'supervisorEmployeeNumber',
      createTimesheetForm.supervisorEmployeeNumber
    )
    .input('timesheetTitle', createTimesheetForm.timesheetTitle)
    .input('timesheetNote', createTimesheetForm.timesheetNote)
    .input('shiftId', createTimesheetForm.shiftId ?? undefined)
    .input('userName', userName)
    .query(/* sql */ `
      INSERT INTO
        ShiftLog.Timesheets (
          instance,
          supervisorEmployeeNumber,
          timesheetTypeDataListItemId,
          timesheetTitle,
          timesheetNote,
          timesheetDate,
          shiftId,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.timesheetId
      VALUES
        (
          @instance,
          @supervisorEmployeeNumber,
          @timesheetTypeDataListItemId,
          @timesheetTitle,
          @timesheetNote,
          @timesheetDate,
          @shiftId,
          @userName,
          @userName
        )
    `)) as mssql.IResult<{ timesheetId: number }>

  return result.recordset[0].timesheetId
}
