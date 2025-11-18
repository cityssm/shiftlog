import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function reorderTimesheetColumns(reorderForm) {
    const pool = await getShiftLogConnectionPool();
    // Update order numbers based on the array index
    for (const [index, columnId] of reorderForm.timesheetColumnIds.entries()) {
        await pool
            .request()
            .input('timesheetColumnId', columnId)
            .input('orderNumber', index)
            .input('timesheetId', reorderForm.timesheetId).query(/* sql */ `
        update ShiftLog.TimesheetColumns
        set orderNumber = @orderNumber
        where timesheetColumnId = @timesheetColumnId
          and timesheetId = @timesheetId
      `);
    }
    return true;
}
