import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateTimesheet(updateTimesheetForm, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('timesheetId', updateTimesheetForm.timesheetId)
        .input('timesheetDate', updateTimesheetForm.timesheetDateString)
        .input('timesheetTypeDataListItemId', updateTimesheetForm.timesheetTypeDataListItemId)
        .input('supervisorEmployeeNumber', updateTimesheetForm.supervisorEmployeeNumber)
        .input('timesheetTitle', updateTimesheetForm.timesheetTitle)
        .input('timesheetNote', updateTimesheetForm.timesheetNote)
        .input('shiftId', updateTimesheetForm.shiftId ?? null)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.Timesheets
      set
        supervisorEmployeeNumber = @supervisorEmployeeNumber,
        timesheetTypeDataListItemId = @timesheetTypeDataListItemId,
        timesheetTitle = @timesheetTitle,
        timesheetNote = @timesheetNote,
        timesheetDate = @timesheetDate,
        shiftId = @shiftId,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where timesheetId = @timesheetId
        and recordDelete_dateTime is null
        and employeesEntered_dateTime is null
        and equipmentEntered_dateTime is null
    `);
    return result.rowsAffected[0] > 0;
}
