import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getTimesheetCells(timesheetId) {
    const pool = await getShiftLogConnectionPool();
    const sql = /* sql */ `
    select
      tc.timesheetRowId,
      tc.timesheetColumnId,
      tc.recordHours,
      tc.mappedPositionCode,
      tc.mappedPayCode,
      tc.mappedTimeCode,
      tc.mappingConfidence
    from ShiftLog.TimesheetCells tc
    inner join ShiftLog.TimesheetRows tr
      on tc.timesheetRowId = tr.timesheetRowId
    where tr.timesheetId = @timesheetId
      and tr.instance = @instance
  `;
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetId', timesheetId)
        .query(sql));
    return result.recordset;
}
