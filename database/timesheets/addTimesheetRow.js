import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addTimesheetRow(addRowForm) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('timesheetId', addRowForm.timesheetId)
        .input('rowTitle', addRowForm.rowTitle)
        .input('employeeNumber', addRowForm.employeeNumber ?? undefined)
        .input('equipmentNumber', addRowForm.equipmentNumber ?? undefined)
        .input('jobClassificationDataListItemId', addRowForm.jobClassificationDataListItemId ?? undefined)
        .input('timeCodeDataListItemId', addRowForm.timeCodeDataListItemId ?? undefined)
        .query(/* sql */ `
      INSERT INTO
        ShiftLog.TimesheetRows (
          instance,
          timesheetId,
          rowTitle,
          employeeNumber,
          equipmentNumber,
          jobClassificationDataListItemId,
          timeCodeDataListItemId
        ) output inserted.timesheetRowId
      VALUES
        (
          @instance,
          @timesheetId,
          @rowTitle,
          @employeeNumber,
          @equipmentNumber,
          @jobClassificationDataListItemId,
          @timeCodeDataListItemId
        )
    `));
    return result.recordset[0].timesheetRowId;
}
