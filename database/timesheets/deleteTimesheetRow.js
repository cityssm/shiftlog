import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteTimesheetRow(timesheetRowId) {
    const pool = await getShiftLogConnectionPool();
    // Delete cells first
    await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetRowId', timesheetRowId).query(/* sql */ `
      delete from ShiftLog.TimesheetCells
      where timesheetRowId = @timesheetRowId
        and timesheetRowId in (
          select timesheetRowId
          from ShiftLog.TimesheetRows
          where instance = @instance
        )
    `);
    // Delete row
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetRowId', timesheetRowId).query(/* sql */ `
      delete from ShiftLog.TimesheetRows
      where timesheetRowId = @timesheetRowId
        and instance = @instance
    `);
    return result.rowsAffected[0] > 0;
}
