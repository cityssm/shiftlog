import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getTimesheetColumns(timesheetId) {
    const pool = await getShiftLogConnectionPool();
    const sql = /* sql */ `
    select
      timesheetColumnId,
      timesheetId,
      columnTitle,
      workOrderNumber,
      costCenterA,
      costCenterB,
      orderNumber
    from ShiftLog.TimesheetColumns
    where timesheetId = @timesheetId
    order by orderNumber, timesheetColumnId
  `;
    const result = (await pool
        .request()
        .input('timesheetId', timesheetId)
        .query(sql));
    return result.recordset;
}
