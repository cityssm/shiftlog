import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Shift } from '../../types/record.types.js'

export default async function getDeletedShifts(
  user?: User
): Promise<Shift[]> {
  const pool = await getShiftLogConnectionPool()

  let whereClause =
    'where s.instance = @instance and s.recordDelete_dateTime is not null'

  if (user !== undefined) {
    whereClause += `
      and (
        sType.userGroupId is null or sType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        )
      )
    `
  }

  const shiftsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName).query<Shift>(/* sql */ `
      select
        s.shiftId, s.shiftDate,

        s.shiftTimeDataListItemId,
        sTime.dataListItem as shiftTimeDataListItem,

        s.shiftTypeDataListItemId,
        sType.dataListItem as shiftTypeDataListItem,

        s.supervisorEmployeeNumber,
        e.firstName as supervisorFirstName,
        e.lastName as supervisorLastName,
        e.userName as supervisorUserName,

        s.recordDelete_userName,
        s.recordDelete_dateTime

      from ShiftLog.Shifts s

      left join ShiftLog.DataListItems sTime
        on s.shiftTimeDataListItemId = sTime.dataListItemId

      left join ShiftLog.DataListItems sType
        on s.shiftTypeDataListItemId = sType.dataListItemId

      left join ShiftLog.Employees e
          on s.instance = e.instance
          and s.supervisorEmployeeNumber = e.employeeNumber

      ${whereClause}

      order by s.recordDelete_dateTime desc
    `)

  const shifts = shiftsResult.recordset

  return shifts
}
