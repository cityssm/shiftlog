import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateTimesheetRow(updateRowForm) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('timesheetRowId', updateRowForm.timesheetRowId)
        .input('instance', getConfigProperty('application.instance'))
        .input('rowTitle', updateRowForm.rowTitle)
        .input('jobClassificationDataListItemId', updateRowForm.jobClassificationDataListItemId ?? undefined)
        .input('timeCodeDataListItemId', updateRowForm.timeCodeDataListItemId ?? undefined)
        .query(/* sql */ `
      UPDATE ShiftLog.TimesheetRows
      SET
        rowTitle = @rowTitle,
        jobClassificationDataListItemId = @jobClassificationDataListItemId,
        timeCodeDataListItemId = @timeCodeDataListItemId
      WHERE
        timesheetRowId = @timesheetRowId
        AND instance = @instance
    `);
    return result.rowsAffected[0] > 0;
}
