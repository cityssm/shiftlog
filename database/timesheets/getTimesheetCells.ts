import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { TimesheetCell } from '../../types/record.types.js'

export default async function getTimesheetCells(
  timesheetId: number | string
): Promise<TimesheetCell[]> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    SELECT
      tc.timesheetRowId,
      tc.timesheetColumnId,
      tc.recordHours,
      tc.mappedPositionCode,
      tc.mappedPayCode,
      tc.mappedTimeCode,
      tc.mappingConfidence
    FROM
      ShiftLog.TimesheetCells tc
      INNER JOIN ShiftLog.TimesheetRows tr ON tc.timesheetRowId = tr.timesheetRowId
    WHERE
      tr.timesheetId = @timesheetId
      AND tr.instance = @instance
  `

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('timesheetId', timesheetId)
    .query<TimesheetCell>(sql)

  return result.recordset
}
