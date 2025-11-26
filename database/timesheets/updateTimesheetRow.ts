import { getConfigProperty } from '../../helpers/config.helpers.js'
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
    .input('instance', getConfigProperty('application.instance'))
    .input('rowTitle', updateRowForm.rowTitle)
    .input(
      'jobClassificationDataListItemId',
      updateRowForm.jobClassificationDataListItemId ?? undefined
    )
    .input(
      'timeCodeDataListItemId',
      updateRowForm.timeCodeDataListItemId ?? undefined
    ).query(/* sql */ `
      update ShiftLog.TimesheetRows
      set
        rowTitle = @rowTitle,
        jobClassificationDataListItemId = @jobClassificationDataListItemId,
        timeCodeDataListItemId = @timeCodeDataListItemId
      where timesheetRowId = @timesheetRowId
        and instance = @instance
    `)

  return result.rowsAffected[0] > 0
}
