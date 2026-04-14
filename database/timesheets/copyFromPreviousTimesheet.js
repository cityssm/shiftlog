import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function copyFromPreviousTimesheet(sourceTimesheetId, targetTimesheetId) {
    const pool = await getShiftLogConnectionPool();
    await pool
        .request()
        .input('sourceTimesheetId', sourceTimesheetId)
        .input('targetTimesheetId', targetTimesheetId)
        .query(`
      INSERT INTO
        ShiftLog.TimesheetColumns (
          timesheetId,
          columnTitle,
          workOrderNumber,
          costCenterA,
          costCenterB,
          orderNumber
        )
      SELECT
        @targetTimesheetId,
        columnTitle,
        workOrderNumber,
        costCenterA,
        costCenterB,
        orderNumber
      FROM
        ShiftLog.TimesheetColumns
      WHERE
        timesheetId = @sourceTimesheetId
    `);
    await pool
        .request()
        .input('sourceTimesheetId', sourceTimesheetId)
        .input('targetTimesheetId', targetTimesheetId)
        .query(`
      INSERT INTO
        ShiftLog.TimesheetRows (
          instance,
          timesheetId,
          rowTitle,
          employeeNumber,
          equipmentNumber,
          jobClassificationDataListItemId,
          timeCodeDataListItemId
        )
      SELECT
        instance,
        @targetTimesheetId,
        rowTitle,
        employeeNumber,
        equipmentNumber,
        jobClassificationDataListItemId,
        timeCodeDataListItemId
      FROM
        ShiftLog.TimesheetRows
      WHERE
        timesheetId = @sourceTimesheetId
    `);
    await pool
        .request()
        .input('sourceTimesheetId', sourceTimesheetId)
        .input('targetTimesheetId', targetTimesheetId)
        .query(`
      INSERT INTO
        ShiftLog.TimesheetCells (timesheetRowId, timesheetColumnId, recordHours)
      SELECT
        newRow.timesheetRowId,
        newCol.timesheetColumnId,
        oldCell.recordHours
      FROM
        ShiftLog.TimesheetCells oldCell
        INNER JOIN ShiftLog.TimesheetRows oldRow ON oldCell.timesheetRowId = oldRow.timesheetRowId
        INNER JOIN ShiftLog.TimesheetColumns oldCol ON oldCell.timesheetColumnId = oldCol.timesheetColumnId
        INNER JOIN ShiftLog.TimesheetRows newRow ON newRow.timesheetId = @targetTimesheetId
        AND (
          (
            oldRow.employeeNumber IS NOT NULL
            AND newRow.employeeNumber = oldRow.employeeNumber
          )
          OR (
            oldRow.equipmentNumber IS NOT NULL
            AND newRow.equipmentNumber = oldRow.equipmentNumber
          )
        )
        INNER JOIN ShiftLog.TimesheetColumns newCol ON newCol.timesheetId = @targetTimesheetId
        AND newCol.orderNumber = oldCol.orderNumber
      WHERE
        oldRow.timesheetId = @sourceTimesheetId
        AND oldCell.recordHours > 0
    `);
    return true;
}
