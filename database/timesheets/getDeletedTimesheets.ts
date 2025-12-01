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
    whereClause += `
      and (
        tType.userGroupId is null or tType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        )
      )
    `
  }

  const timesheetsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName).query<Timesheet>(/* sql */ `
      select
        t.timesheetId,
        t.timesheetDate,

        t.timesheetTypeDataListItemId,
        tType.dataListItem as timesheetTypeDataListItem,

        t.supervisorEmployeeNumber,
        supervisor.employeeSurname as supervisorEmployeeSurname,
        supervisor.employeeGivenName as supervisorEmployeeGivenName,

        t.timesheetDetails,

        t.recordDelete_userName,
        t.recordDelete_dateTime

      from ShiftLog.Timesheets t

      left join ShiftLog.DataListItems tType
        on t.timesheetTypeDataListItemId = tType.dataListItemId

      left join ShiftLog.Employees supervisor
        on t.supervisorEmployeeNumber = supervisor.employeeNumber
          and t.instance = supervisor.instance

      ${whereClause}

      order by t.recordDelete_dateTime desc
    `)

  const timesheets = timesheetsResult.recordset

  return timesheets
}
