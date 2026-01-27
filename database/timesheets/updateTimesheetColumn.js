import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateTimesheetColumn(updateColumnForm) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('timesheetColumnId', updateColumnForm.timesheetColumnId)
        .input('columnTitle', updateColumnForm.columnTitle)
        .input('workOrderNumber', updateColumnForm.workOrderNumber ?? undefined)
        .input('costCenterA', updateColumnForm.costCenterA ?? undefined)
        .input('costCenterB', updateColumnForm.costCenterB ?? undefined)
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      UPDATE ShiftLog.TimesheetColumns
      SET
        columnTitle = @columnTitle,
        workOrderNumber = @workOrderNumber,
        costCenterA = @costCenterA,
        costCenterB = @costCenterB
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
    return result.rowsAffected[0] > 0;
}
