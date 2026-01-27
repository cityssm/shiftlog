import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Timesheet } from '../../types/record.types.js'

export default async function getTimesheetsByShift(
  shiftId: number | string,
  user?: User
): Promise<Timesheet[]> {
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
      t.recordSubmitted_dateTime,
      t.recordSubmitted_userName,
      t.employeesEntered_dateTime,
      t.employeesEntered_userName,
      t.equipmentEntered_dateTime,
      t.equipmentEntered_userName
    FROM
      ShiftLog.Timesheets t
      LEFT JOIN ShiftLog.DataListItems tType ON t.timesheetTypeDataListItemId = tType.dataListItemId
      LEFT JOIN ShiftLog.Employees e ON t.instance = e.instance
      AND t.supervisorEmployeeNumber = e.employeeNumber
    WHERE
      t.instance = @instance
      AND t.recordDelete_dateTime IS NULL
      AND t.shiftId = @shiftId ${user === undefined
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
    ORDER BY
      t.timesheetDate DESC,
      tType.dataListItem,
      t.timesheetTitle
  `

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('shiftId', shiftId)
    .input('userName', user?.userName)
    .query<Timesheet>(sql)

  return result.recordset
}
