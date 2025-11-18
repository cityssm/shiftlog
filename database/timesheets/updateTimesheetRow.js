import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateTimesheetRow(updateRowForm) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('timesheetRowId', updateRowForm.timesheetRowId)
        .input('rowTitle', updateRowForm.rowTitle)
        .input('jobClassificationDataListItemId', updateRowForm.jobClassificationDataListItemId ?? null)
        .input('timeCodeDataListItemId', updateRowForm.timeCodeDataListItemId ?? null).query(/* sql */ `
      update ShiftLog.TimesheetRows
      set
        rowTitle = @rowTitle,
        jobClassificationDataListItemId = @jobClassificationDataListItemId,
        timeCodeDataListItemId = @timeCodeDataListItemId
      where timesheetRowId = @timesheetRowId
    `);
    return result.rowsAffected[0] > 0;
}
