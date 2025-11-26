import { getConfigProperty } from '../../helpers/config.helpers.js'
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
      .input('orderNumber', index)
      .input('timesheetId', reorderForm.timesheetId)
      .input('instance', getConfigProperty('application.instance'))
      .query(/* sql */ `
        update ShiftLog.TimesheetColumns
        set orderNumber = @orderNumber
        where timesheetColumnId = @timesheetColumnId
          and timesheetId = @timesheetId
          and timesheetId in (
            select timesheetId
            from ShiftLog.Timesheets
            where instance = @instance
          )
      `)
  }

  return true
}
