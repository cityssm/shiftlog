import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
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
    .input('instance', getConfigProperty('application.instance'))
    .input('timesheetId', addRowForm.timesheetId)
    .input('rowTitle', addRowForm.rowTitle)
    .input('employeeNumber', addRowForm.employeeNumber ?? undefined)
    .input('equipmentNumber', addRowForm.equipmentNumber ?? undefined)
    .input(
      'jobClassificationDataListItemId',
      addRowForm.jobClassificationDataListItemId ?? undefined
    )
    .input(
      'timeCodeDataListItemId',
      addRowForm.timeCodeDataListItemId ?? undefined
    )
    .query(/* sql */ `
      INSERT INTO
        ShiftLog.TimesheetRows (
          instance,
          timesheetId,
          rowTitle,
          employeeNumber,
          equipmentNumber,
          jobClassificationDataListItemId,
          timeCodeDataListItemId
        ) output inserted.timesheetRowId
      VALUES
        (
          @instance,
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
