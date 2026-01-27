import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteTimesheetColumn(timesheetColumnId) {
    const pool = await getShiftLogConnectionPool();
    // Check for recorded hours before deleting
    const hoursResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetColumnId', timesheetColumnId)
        .query(/* sql */ `
      SELECT
        isnull(sum(recordHours), 0) AS totalHours
      FROM
        ShiftLog.TimesheetCells
      WHERE
        timesheetColumnId = @timesheetColumnId
        AND timesheetRowId IN (
          SELECT
            timesheetRowId
          FROM
            ShiftLog.TimesheetRows
          WHERE
            instance = @instance
        )
    `);
    const totalHours = hoursResult.recordset[0]?.totalHours ?? 0;
    // Delete cells first
    await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetColumnId', timesheetColumnId)
        .query(/* sql */ `
      DELETE FROM ShiftLog.TimesheetCells
      WHERE
        timesheetColumnId = @timesheetColumnId
        AND timesheetRowId IN (
          SELECT
            timesheetRowId
          FROM
            ShiftLog.TimesheetRows
          WHERE
            instance = @instance
        )
    `);
    // Delete column
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetColumnId', timesheetColumnId)
        .query(/* sql */ `
      DELETE FROM ShiftLog.TimesheetColumns
      WHERE
        timesheetColumnId = @timesheetColumnId
        AND timesheetId IN (
          SELECT
            timesheetId
          FROM
            ShiftLog.Timesheets
          WHERE
            instance = @instance
        )
    `);
    return {
        success: result.rowsAffected[0] > 0,
        totalHours
    };
}
