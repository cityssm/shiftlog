import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateTimesheetColumnForm {
  timesheetColumnId: number | string
  columnTitle: string
  workOrderNumber?: string
  costCenterA?: string
  costCenterB?: string
}

export default async function updateTimesheetColumn(
  updateColumnForm: UpdateTimesheetColumnForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('timesheetColumnId', updateColumnForm.timesheetColumnId)
    .input('columnTitle', updateColumnForm.columnTitle)
    .input('workOrderNumber', updateColumnForm.workOrderNumber ?? undefined)
    .input('costCenterA', updateColumnForm.costCenterA ?? undefined)
    .input('costCenterB', updateColumnForm.costCenterB ?? undefined)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      UPDATE ShiftLog.TimesheetColumns
      SET
        columnTitle = @columnTitle,
        workOrderNumber = @workOrderNumber,
        costCenterA = @costCenterA,
        costCenterB = @costCenterB
      WHERE
        timesheetColumnId = @timesheetColumnId
        AND timesheetId IN (
          SELECT
            timesheetId
          FROM
            ShiftLog.Timesheets
          WHERE
            instance = @instance
        )
    `)

  return result.rowsAffected[0] > 0
}
