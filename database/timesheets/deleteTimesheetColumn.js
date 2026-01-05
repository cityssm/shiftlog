import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteTimesheetColumn(timesheetColumnId) {
    const pool = await getShiftLogConnectionPool();
    // Check for recorded hours before deleting
    const hoursResult = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetColumnId', timesheetColumnId).query(/* sql */ `
      select isnull(sum(recordHours), 0) as totalHours
      from ShiftLog.TimesheetCells
      where timesheetColumnId = @timesheetColumnId
        and timesheetRowId in (
          select timesheetRowId
          from ShiftLog.TimesheetRows
          where instance = @instance
        )
    `));
    const totalHours = hoursResult.recordset[0]?.totalHours ?? 0;
    // Delete cells first
    await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetColumnId', timesheetColumnId).query(/* sql */ `
      delete from ShiftLog.TimesheetCells
      where timesheetColumnId = @timesheetColumnId
        and timesheetRowId in (
          select timesheetRowId
          from ShiftLog.TimesheetRows
          where instance = @instance
        )
    `);
    // Delete column
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetColumnId', timesheetColumnId).query(/* sql */ `
      delete from ShiftLog.TimesheetColumns
      where timesheetColumnId = @timesheetColumnId
        and timesheetId in (
          select timesheetId
          from ShiftLog.Timesheets
          where instance = @instance
        )
    `);
    return {
        success: result.rowsAffected[0] > 0,
        totalHours
    };
}
