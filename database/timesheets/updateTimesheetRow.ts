import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateTimesheetRowForm {
  timesheetRowId: number | string
  rowTitle: string
  jobClassificationDataListItemId?: number | string | null
  timeCodeDataListItemId?: number | string | null
}

export default async function updateTimesheetRow(
  updateRowForm: UpdateTimesheetRowForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('timesheetRowId', updateRowForm.timesheetRowId)
    .input('rowTitle', updateRowForm.rowTitle)
    .input('jobClassificationDataListItemId', updateRowForm.jobClassificationDataListItemId ?? null)
    .input('timeCodeDataListItemId', updateRowForm.timeCodeDataListItemId ?? null).query(/* sql */ `
      update ShiftLog.TimesheetRows
      set
        rowTitle = @rowTitle,
        jobClassificationDataListItemId = @jobClassificationDataListItemId,
        timeCodeDataListItemId = @timeCodeDataListItemId
      where timesheetRowId = @timesheetRowId
    `)

  return result.rowsAffected[0] > 0
}
