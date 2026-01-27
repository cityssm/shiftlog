import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getTimesheetColumns(timesheetId) {
    const pool = await getShiftLogConnectionPool();
    const sql = /* sql */ `
    SELECT
      timesheetColumnId,
      timesheetId,
      columnTitle,
      workOrderNumber,
      costCenterA,
      costCenterB,
      orderNumber
    FROM
      ShiftLog.TimesheetColumns
    WHERE
      timesheetId = @timesheetId
      AND timesheetId IN (
        SELECT
          timesheetId
        FROM
          ShiftLog.Timesheets
        WHERE
          instance = @instance
      )
    ORDER BY
      orderNumber,
      timesheetColumnId
  `;
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetId', timesheetId)
        .query(sql));
    return result.recordset;
}
