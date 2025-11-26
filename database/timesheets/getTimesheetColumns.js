import { getConfigProperty } from '../../helpers/config.helpers.js';
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
      and timesheetId in (
        select timesheetId
        from ShiftLog.Timesheets
        where instance = @instance
      )
    order by orderNumber, timesheetColumnId
  `;
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetId', timesheetId)
        .query(sql));
    return result.recordset;
}
