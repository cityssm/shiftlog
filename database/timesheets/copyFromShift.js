import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function copyFromShift(shiftId, timesheetId) {
    const pool = await getShiftLogConnectionPool();
    // Copy work orders as columns
    await pool
        .request()
        .input('shiftId', shiftId)
        .input('timesheetId', timesheetId)
        .query(/* sql */ `
      INSERT INTO
        ShiftLog.TimesheetColumns (
          timesheetId,
          columnTitle,
          workOrderNumber,
          orderNumber
        )
      SELECT
        @timesheetId,
        w.workOrderNumber,
        w.workOrderNumber,
        row_number() OVER (
          ORDER BY
            w.workOrderNumber
        ) - 1
      FROM
        ShiftLog.ShiftWorkOrders sw
        INNER JOIN ShiftLog.WorkOrders w ON sw.workOrderId = w.workOrderId
      WHERE
        sw.shiftId = @shiftId
        AND w.recordDelete_dateTime IS NULL
    `);
    // Copy employees as rows
    await pool
        .request()
        .input('shiftId', shiftId)
        .input('timesheetId', timesheetId)
        .query(/* sql */ `
      INSERT INTO
        ShiftLog.TimesheetRows (instance, timesheetId, rowTitle, employeeNumber)
      SELECT
        se.instance,
        @timesheetId,
        e.lastName + ', ' + e.firstName,
        se.employeeNumber
      FROM
        ShiftLog.ShiftEmployees se
        INNER JOIN ShiftLog.Employees e ON se.instance = e.instance
        AND se.employeeNumber = e.employeeNumber
      WHERE
        se.shiftId = @shiftId
        AND e.recordDelete_dateTime IS NULL
    `);
    // Copy equipment as rows (with employee assignments maintained)
    await pool
        .request()
        .input('shiftId', shiftId)
        .input('timesheetId', timesheetId)
        .query(/* sql */ `
      INSERT INTO
        ShiftLog.TimesheetRows (
          instance,
          timesheetId,
          rowTitle,
          equipmentNumber,
          employeeNumber
        )
      SELECT
        se.instance,
        @timesheetId,
        eq.equipmentName,
        se.equipmentNumber,
        se.employeeNumber
      FROM
        ShiftLog.ShiftEquipment se
        INNER JOIN ShiftLog.Equipment eq ON se.instance = eq.instance
        AND se.equipmentNumber = eq.equipmentNumber
      WHERE
        se.shiftId = @shiftId
        AND eq.recordDelete_dateTime IS NULL
    `);
    return true;
}
