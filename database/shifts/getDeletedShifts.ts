import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Shift } from '../../types/record.types.js'

export default async function getDeletedShifts(user?: User): Promise<Shift[]> {
  const pool = await getShiftLogConnectionPool()

  let whereClause =
    'where s.instance = @instance and s.recordDelete_dateTime is not null'

  if (user !== undefined) {
    whereClause += /* sql */ `
      AND (
        sType.userGroupId IS NULL
        OR sType.userGroupId IN (
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

  const shiftsResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', user?.userName)
    .query<Shift>(/* sql */ `
      SELECT
        s.shiftId,
        s.shiftDate,
        s.shiftTimeDataListItemId,
        sTime.dataListItem AS shiftTimeDataListItem,
        s.shiftTypeDataListItemId,
        sType.dataListItem AS shiftTypeDataListItem,
        s.supervisorEmployeeNumber,
        e.firstName AS supervisorFirstName,
        e.lastName AS supervisorLastName,
        e.userName AS supervisorUserName,
        s.recordDelete_userName,
        s.recordDelete_dateTime
      FROM
        ShiftLog.Shifts s
        LEFT JOIN ShiftLog.DataListItems sTime ON s.shiftTimeDataListItemId = sTime.dataListItemId
        LEFT JOIN ShiftLog.DataListItems sType ON s.shiftTypeDataListItemId = sType.dataListItemId
        LEFT JOIN ShiftLog.Employees e ON s.instance = e.instance
        AND s.supervisorEmployeeNumber = e.employeeNumber ${whereClause}
      ORDER BY
        s.recordDelete_dateTime DESC
    `)

  const shifts = shiftsResult.recordset

  return shifts
}
