import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function reorderTimesheetColumns(reorderForm) {
    const pool = await getShiftLogConnectionPool();
    for (const [index, columnId] of reorderForm.timesheetColumnIds.entries()) {
        await pool
            .request()
            .input('timesheetColumnId', columnId)
            .input('orderNumber', index)
            .input('timesheetId', reorderForm.timesheetId)
            .input('instance', getConfigProperty('application.instance'))
            .query(`
        UPDATE ShiftLog.TimesheetColumns
        SET
          orderNumber = @orderNumber
        WHERE
          timesheetColumnId = @timesheetColumnId
          AND timesheetId = @timesheetId
          AND timesheetId IN (
            SELECT
              timesheetId
            FROM
              ShiftLog.Timesheets
            WHERE
              instance = @instance
          )
      `);
    }
    return true;
}
