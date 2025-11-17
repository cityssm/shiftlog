import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface ReorderTimesheetColumnsForm {
  timesheetId: number | string
  timesheetColumnIds: Array<number | string>
}

export default async function reorderTimesheetColumns(
  reorderForm: ReorderTimesheetColumnsForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  // Update order numbers based on the array index
  for (const [index, columnId] of reorderForm.timesheetColumnIds.entries()) {
    await pool
      .request()
      .input('timesheetColumnId', columnId)
      .input('orderNumber', index).query(/* sql */ `
        update ShiftLog.TimesheetColumns
        set orderNumber = @orderNumber
        where timesheetColumnId = @timesheetColumnId
          and timesheetId = @timesheetId
      `)
      .input('timesheetId', reorderForm.timesheetId)
  }

  return true
}
