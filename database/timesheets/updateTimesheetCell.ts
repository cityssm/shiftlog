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
      .input('timesheetColumnId', updateCellForm.timesheetColumnId).query(/* sql */ `
        delete from ShiftLog.TimesheetCells
        where timesheetRowId = @timesheetRowId
          and timesheetColumnId = @timesheetColumnId
      `)
    return true
  }

  // Otherwise, insert or update
  const result = await pool
    .request()
    .input('timesheetRowId', updateCellForm.timesheetRowId)
    .input('timesheetColumnId', updateCellForm.timesheetColumnId)
    .input('recordHours', hours).query(/* sql */ `
      merge ShiftLog.TimesheetCells as target
      using (
        select
          @timesheetRowId as timesheetRowId,
          @timesheetColumnId as timesheetColumnId
      ) as source
      on target.timesheetRowId = source.timesheetRowId
        and target.timesheetColumnId = source.timesheetColumnId
      when matched then
        update set recordHours = @recordHours
      when not matched then
        insert (timesheetRowId, timesheetColumnId, recordHours)
        values (@timesheetRowId, @timesheetColumnId, @recordHours);
    `)

  return result.rowsAffected[0] > 0
}
