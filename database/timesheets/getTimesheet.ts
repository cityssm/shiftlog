import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Timesheet } from '../../types/record.types.js'

export default async function getTimesheet(
  timesheetId: number | string,
  user?: User
): Promise<Timesheet | undefined> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    SELECT
      t.timesheetId,
      t.timesheetDate,
      t.timesheetTypeDataListItemId,
      tType.dataListItem AS timesheetTypeDataListItem,
      t.supervisorEmployeeNumber,
      e.firstName AS supervisorFirstName,
      e.lastName AS supervisorLastName,
      e.userName AS supervisorUserName,
      t.timesheetTitle,
      t.timesheetNote,
      t.shiftId,
      s.shiftDescription,
      t.recordSubmitted_dateTime,
      t.recordSubmitted_userName,
      t.employeesEntered_dateTime,
      t.employeesEntered_userName,
      t.equipmentEntered_dateTime,
      t.equipmentEntered_userName
    FROM
      ShiftLog.Timesheets t
      LEFT JOIN ShiftLog.DataListItems tType ON t.timesheetTypeDataListItemId = tType.dataListItemId
      LEFT JOIN ShiftLog.Employees e ON t.supervisorEmployeeNumber = e.employeeNumber
      LEFT JOIN ShiftLog.Shifts s ON t.shiftId = s.shiftId
    WHERE
      t.instance = @instance
      AND t.recordDelete_dateTime IS NULL
      AND t.timesheetId = @timesheetId ${user === undefined
        ? ''
        : /* sql */ `
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
          `}
  `
  const timesheetsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('timesheetId', timesheetId)
    .input('userName', user?.userName)
    .query<Timesheet>(sql)

  if (timesheetsResult.recordset.length === 0) {
    return undefined
  }

  const timesheet = timesheetsResult.recordset[0]

  return timesheet
}
