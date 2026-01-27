import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addTimesheetColumn(addColumnForm) {
    const pool = await getShiftLogConnectionPool();
    // Get the next order number
    const maxOrderResult = await pool
        .request()
        .input('timesheetId', addColumnForm.timesheetId)
        .query(/* sql */ `
      SELECT
        isnull(max(orderNumber), -1) + 1 AS nextOrderNumber
      FROM
        ShiftLog.TimesheetColumns
      WHERE
        timesheetId = @timesheetId
    `);
    const nextOrderNumber = maxOrderResult.recordset[0].nextOrderNumber;
    const result = (await pool
        .request()
        .input('timesheetId', addColumnForm.timesheetId)
        .input('columnTitle', addColumnForm.columnTitle)
        .input('workOrderNumber', addColumnForm.workOrderNumber ?? null)
        .input('costCenterA', addColumnForm.costCenterA ?? null)
        .input('costCenterB', addColumnForm.costCenterB ?? null)
        .input('orderNumber', nextOrderNumber)
        .query(/* sql */ `
      INSERT INTO
        ShiftLog.TimesheetColumns (
          timesheetId,
          columnTitle,
          workOrderNumber,
          costCenterA,
          costCenterB,
          orderNumber
        ) output inserted.timesheetColumnId
      VALUES
        (
          @timesheetId,
          @columnTitle,
          @workOrderNumber,
          @costCenterA,
          @costCenterB,
          @orderNumber
        )
    `));
    return result.recordset[0].timesheetColumnId;
}
