import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteTimesheetColumn(timesheetColumnId) {
    const pool = await getShiftLogConnectionPool();
    // Delete cells first
    await pool
        .request()
        .input('timesheetColumnId', timesheetColumnId).query(/* sql */ `
      delete from ShiftLog.TimesheetCells
      where timesheetColumnId = @timesheetColumnId
    `);
    // Delete column
    const result = await pool
        .request()
        .input('timesheetColumnId', timesheetColumnId).query(/* sql */ `
      delete from ShiftLog.TimesheetColumns
      where timesheetColumnId = @timesheetColumnId
    `);
    return result.rowsAffected[0] > 0;
}
