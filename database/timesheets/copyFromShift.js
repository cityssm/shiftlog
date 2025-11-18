import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function copyFromShift(shiftId, timesheetId) {
    const pool = await getShiftLogConnectionPool();
    // Copy employees as rows
    await pool
        .request()
        .input('shiftId', shiftId)
        .input('timesheetId', timesheetId).query(/* sql */ `
      insert into ShiftLog.TimesheetRows (
        timesheetId,
        rowTitle,
        employeeNumber
      )
      select
        @timesheetId,
        e.firstName + ' ' + e.lastName,
        se.employeeNumber
      from ShiftLog.ShiftEmployees se
      inner join ShiftLog.Employees e
        on se.employeeNumber = e.employeeNumber
      where se.shiftId = @shiftId
        and e.recordDelete_dateTime is null
    `);
    // Copy equipment as rows
    await pool
        .request()
        .input('shiftId', shiftId)
        .input('timesheetId', timesheetId).query(/* sql */ `
      insert into ShiftLog.TimesheetRows (
        timesheetId,
        rowTitle,
        equipmentNumber
      )
      select
        @timesheetId,
        eq.equipmentName,
        se.equipmentNumber
      from ShiftLog.ShiftEquipment se
      inner join ShiftLog.Equipment eq
        on se.equipmentNumber = eq.equipmentNumber
      where se.shiftId = @shiftId
        and eq.recordDelete_dateTime is null
    `);
    return true;
}
