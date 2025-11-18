import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateTimesheetColumn(updateColumnForm) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('timesheetColumnId', updateColumnForm.timesheetColumnId)
        .input('columnTitle', updateColumnForm.columnTitle)
        .input('workOrderNumber', updateColumnForm.workOrderNumber ?? null)
        .input('costCenterA', updateColumnForm.costCenterA ?? null)
        .input('costCenterB', updateColumnForm.costCenterB ?? null).query(/* sql */ `
      update ShiftLog.TimesheetColumns
      set
        columnTitle = @columnTitle,
        workOrderNumber = @workOrderNumber,
        costCenterA = @costCenterA,
        costCenterB = @costCenterB
      where timesheetColumnId = @timesheetColumnId
    `);
    return result.rowsAffected[0] > 0;
}
