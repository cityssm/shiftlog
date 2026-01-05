import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function copyFromShift(shiftId, timesheetId) {
    const pool = await getShiftLogConnectionPool();
    // Copy work orders as columns
    await pool
        .request()
        .input('shiftId', shiftId)
        .input('timesheetId', timesheetId)
        .query(/* sql */ `
      insert into ShiftLog.TimesheetColumns (
        timesheetId,
        columnTitle,
        workOrderNumber,
        orderNumber
      )
      select
        @timesheetId,
        w.workOrderNumber,
        w.workOrderNumber,
        row_number() over (order by w.workOrderNumber) - 1
      from ShiftLog.ShiftWorkOrders sw
      inner join ShiftLog.WorkOrders w
        on sw.workOrderId = w.workOrderId
      where sw.shiftId = @shiftId
        and w.recordDelete_dateTime is null
    `);
    // Copy employees as rows
    await pool
        .request()
        .input('shiftId', shiftId)
        .input('timesheetId', timesheetId)
        .query(/* sql */ `
      insert into ShiftLog.TimesheetRows (
        instance,
        timesheetId,
        rowTitle,
        employeeNumber
      )
      select
        se.instance,
        @timesheetId,
        e.lastName + ', ' + e.firstName,
        se.employeeNumber
      from ShiftLog.ShiftEmployees se
      inner join ShiftLog.Employees e
        on se.instance = e.instance and se.employeeNumber = e.employeeNumber
      where se.shiftId = @shiftId
        and e.recordDelete_dateTime is null
    `);
    // Copy equipment as rows
    await pool
        .request()
        .input('shiftId', shiftId)
        .input('timesheetId', timesheetId).query(/* sql */ `
      insert into ShiftLog.TimesheetRows (
        instance,
        timesheetId,
        rowTitle,
        equipmentNumber
      )
      select
        se.instance,
        @timesheetId,
        eq.equipmentName,
        se.equipmentNumber
      from ShiftLog.ShiftEquipment se
      inner join ShiftLog.Equipment eq
        on  se.instance = eq.instance and se.equipmentNumber = eq.equipmentNumber
      where se.shiftId = @shiftId
        and eq.recordDelete_dateTime is null
    `);
    return true;
}
