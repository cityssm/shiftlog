import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Timesheet } from '../../types/record.types.js'

export default async function getTimesheet(
  timesheetId: number | string,
  user?: User
): Promise<Timesheet | undefined> {
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
      s.shiftDescription,

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
      on t.supervisorEmployeeNumber = e.employeeNumber

    left join ShiftLog.Shifts s
      on t.shiftId = s.shiftId

    where t.recordDelete_dateTime is null
      and t.timesheetId = @timesheetId

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
  `
  const timesheetsResult = (await pool
    .request()
    .input('timesheetId', timesheetId)
    .input('userName', user?.userName)
    .query(sql)) as mssql.IResult<Timesheet>

  if (timesheetsResult.recordset.length === 0) {
    return undefined
  }

  const timesheet = timesheetsResult.recordset[0]

  return timesheet
}
