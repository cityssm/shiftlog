import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addTimesheetRow(addRowForm) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('timesheetId', addRowForm.timesheetId)
        .input('rowTitle', addRowForm.rowTitle)
        .input('employeeNumber', addRowForm.employeeNumber ?? null)
        .input('equipmentNumber', addRowForm.equipmentNumber ?? null)
        .input('jobClassificationDataListItemId', addRowForm.jobClassificationDataListItemId ?? null)
        .input('timeCodeDataListItemId', addRowForm.timeCodeDataListItemId ?? null).query(/* sql */ `
      insert into ShiftLog.TimesheetRows (
        timesheetId,
        rowTitle,
        employeeNumber,
        equipmentNumber,
        jobClassificationDataListItemId,
        timeCodeDataListItemId
      )
      output inserted.timesheetRowId
      values (
        @timesheetId,
        @rowTitle,
        @employeeNumber,
        @equipmentNumber,
        @jobClassificationDataListItemId,
        @timeCodeDataListItemId
      )
    `));
    return result.recordset[0].timesheetRowId;
}
