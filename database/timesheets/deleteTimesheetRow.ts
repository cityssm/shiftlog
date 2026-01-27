import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteTimesheetRow(
  timesheetRowId: number | string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  // Delete cells first
  await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('timesheetRowId', timesheetRowId)
    .query(/* sql */ `
      DELETE FROM ShiftLog.TimesheetCells
      WHERE
        timesheetRowId = @timesheetRowId
        AND timesheetRowId IN (
          SELECT
            timesheetRowId
          FROM
            ShiftLog.TimesheetRows
          WHERE
            instance = @instance
        )
    `)

  // Delete row
  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('timesheetRowId', timesheetRowId)
    .query(/* sql */ `
      DELETE FROM ShiftLog.TimesheetRows
      WHERE
        timesheetRowId = @timesheetRowId
        AND instance = @instance
    `)

  return result.rowsAffected[0] > 0
}
