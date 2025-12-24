import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Timesheet } from '../../types/record.types.js'

export default async function getTimesheetsByShift(
  shiftId: number | string,
  user?: User
): Promise<Timesheet[]> {
  const pool = await getShiftLogConnectionPool()

  const sql = /* sql */ `
    select
      t.timesheetId, t.timesheetDate,
      
      t.timesheetTypeDataListItemId,
      tType.dataListItem as timesheetTypeDataListItem,
      
      t.supervisorEmployeeNumber,
      e.firstName as supervisorFirstName,
      e.lastName as supervisorLastName,
      e.userName as supervisorUserName,

      t.timesheetTitle,
      t.timesheetNote,
      
      t.shiftId,

      t.recordSubmitted_dateTime,
      t.recordSubmitted_userName,

      t.employeesEntered_dateTime,
      t.employeesEntered_userName,

      t.equipmentEntered_dateTime,
      t.equipmentEntered_userName

    from ShiftLog.Timesheets t

    left join ShiftLog.DataListItems tType
      on t.timesheetTypeDataListItemId = tType.dataListItemId
      
    left join ShiftLog.Employees e
      on t.instance = e.instance and t.supervisorEmployeeNumber = e.employeeNumber

    where t.instance = @instance
      and t.recordDelete_dateTime is null
      and t.shiftId = @shiftId

    ${
      user === undefined
        ? ''
        : `
            and (
              tType.userGroupId is null or tType.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
          `
    }

    order by t.timesheetDate desc, tType.dataListItem, t.timesheetTitle
  `

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('shiftId', shiftId)
    .input('userName', user?.userName)
    .query<Timesheet>(sql)

  return result.recordset
}
