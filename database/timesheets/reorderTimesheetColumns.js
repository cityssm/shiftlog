import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function reorderTimesheetColumns(reorderForm) {
    const pool = await getShiftLogConnectionPool();
    // Update order numbers based on the array index
    for (const [index, columnId] of reorderForm.timesheetColumnIds.entries()) {
        // eslint-disable-next-line no-await-in-loop
        await pool
            .request()
            .input('timesheetColumnId', columnId)
            .input('orderNumber', index)
            .input('timesheetId', reorderForm.timesheetId)
            .input('instance', getConfigProperty('application.instance'))
            .query(/* sql */ `
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
