import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Timesheet } from '../../types/record.types.js'

export default async function getDeletedTimesheets(
  user?: User
): Promise<Timesheet[]> {
  const pool = await getShiftLogConnectionPool()

  let whereClause =
    'where t.instance = @instance and t.recordDelete_dateTime is not null'

  if (user !== undefined) {
    whereClause += /* sql */ `
      AND (
        tType.userGroupId IS NULL
        OR tType.userGroupId IN (
          SELECT
            userGroupId
          FROM
            ShiftLog.UserGroupMembers
          WHERE
            userName = @userName
        )
      )
    `
  }

  const timesheetsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName)
    .query<Timesheet>(/* sql */ `
      SELECT
        t.timesheetId,
        t.timesheetDate,
        t.timesheetTypeDataListItemId,
        tType.dataListItem AS timesheetTypeDataListItem,
        t.supervisorEmployeeNumber,
        supervisor.employeeSurname AS supervisorEmployeeSurname,
        supervisor.employeeGivenName AS supervisorEmployeeGivenName,
        t.timesheetDetails,
        t.recordDelete_userName,
        t.recordDelete_dateTime
      FROM
        ShiftLog.Timesheets t
        LEFT JOIN ShiftLog.DataListItems tType ON t.timesheetTypeDataListItemId = tType.dataListItemId
        LEFT JOIN ShiftLog.Employees supervisor ON t.supervisorEmployeeNumber = supervisor.employeeNumber
        AND t.instance = supervisor.instance ${whereClause}
      ORDER BY
        t.recordDelete_dateTime DESC
    `)

  const timesheets = timesheetsResult.recordset

  return timesheets
}
