import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface AddTimesheetRowForm {
  timesheetId: number | string
  rowTitle: string
  employeeNumber?: string | null
  equipmentNumber?: string | null
  jobClassificationDataListItemId?: number | string | null
  timeCodeDataListItemId?: number | string | null
}

export default async function addTimesheetRow(
  addRowForm: AddTimesheetRowForm
): Promise<number> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('timesheetId', addRowForm.timesheetId)
    .input('rowTitle', addRowForm.rowTitle)
    .input('employeeNumber', addRowForm.employeeNumber ?? null)
    .input('equipmentNumber', addRowForm.equipmentNumber ?? null)
    .input('jobClassificationDataListItemId', addRowForm.jobClassificationDataListItemId ?? null)
    .input('timeCodeDataListItemId', addRowForm.timeCodeDataListItemId ?? null).query(/* sql */ `
      insert into ShiftLog.TimesheetRows (
        timesheetId,
        rowTitle,
        employeeNumber,
        equipmentNumber,
        jobClassificationDataListItemId,
        timeCodeDataListItemId
      )
      output inserted.timesheetRowId
      values (
        @timesheetId,
        @rowTitle,
        @employeeNumber,
        @equipmentNumber,
        @jobClassificationDataListItemId,
        @timeCodeDataListItemId
      )
    `)) as mssql.IResult<{ timesheetRowId: number }>

  return result.recordset[0].timesheetRowId
}
