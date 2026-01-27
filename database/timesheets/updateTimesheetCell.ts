import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateTimesheetCellForm {
  timesheetRowId: number | string
  timesheetColumnId: number | string
  recordHours: number | string
}

export default async function updateTimesheetCell(
  updateCellForm: UpdateTimesheetCellForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const hours =
    typeof updateCellForm.recordHours === 'string'
      ? Number.parseFloat(updateCellForm.recordHours)
      : updateCellForm.recordHours

  // If hours is 0, delete the cell
  if (hours === 0) {
    await pool
      .request()
      .input('timesheetRowId', updateCellForm.timesheetRowId)
      .input('timesheetColumnId', updateCellForm.timesheetColumnId)
      .query(/* sql */ `
        DELETE FROM ShiftLog.TimesheetCells
        WHERE
          timesheetRowId = @timesheetRowId
          AND timesheetColumnId = @timesheetColumnId
      `)
    return true
  }

  // Otherwise, insert or update
  const result = await pool
    .request()
    .input('timesheetRowId', updateCellForm.timesheetRowId)
    .input('timesheetColumnId', updateCellForm.timesheetColumnId)
    .input('recordHours', hours)
    .query(/* sql */ `
      MERGE
        ShiftLog.TimesheetCells AS target using (
          SELECT
            @timesheetRowId AS timesheetRowId,
            @timesheetColumnId AS timesheetColumnId
        ) AS source ON target.timesheetRowId = source.timesheetRowId
        AND target.timesheetColumnId = source.timesheetColumnId
      WHEN MATCHED THEN
      UPDATE SET
        recordHours = @recordHours
      WHEN NOT MATCHED THEN
      INSERT
        (timesheetRowId, timesheetColumnId, recordHours)
      VALUES
        (@timesheetRowId, @timesheetColumnId, @recordHours);
    `)

  return result.rowsAffected[0] > 0
}
