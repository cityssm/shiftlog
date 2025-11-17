import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteTimesheetRow(
  timesheetRowId: number | string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  // Delete cells first
  await pool
    .request()
    .input('timesheetRowId', timesheetRowId).query(/* sql */ `
      delete from ShiftLog.TimesheetCells
      where timesheetRowId = @timesheetRowId
    `)

  // Delete row
  const result = await pool
    .request()
    .input('timesheetRowId', timesheetRowId).query(/* sql */ `
      delete from ShiftLog.TimesheetRows
      where timesheetRowId = @timesheetRowId
    `)

  return result.rowsAffected[0] > 0
}
