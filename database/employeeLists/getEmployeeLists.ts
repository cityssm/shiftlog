import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { EmployeeList } from '../../types/record.types.js'

export default async function getEmployeeLists(): Promise<EmployeeList[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<EmployeeList>(/* sql */ `
      SELECT
        el.employeeListId,
        el.employeeListName,
        el.userGroupId,
        ug.userGroupName,
        (
          SELECT
            count(*)
          FROM
            ShiftLog.EmployeeListMembers elm
          WHERE
            elm.employeeListId = el.employeeListId
        ) AS memberCount,
        el.recordCreate_userName,
        el.recordCreate_dateTime,
        el.recordUpdate_userName,
        el.recordUpdate_dateTime
      FROM
        ShiftLog.EmployeeLists el
        LEFT JOIN ShiftLog.UserGroups ug ON el.userGroupId = ug.userGroupId
      WHERE
        el.instance = @instance
        AND el.recordDelete_dateTime IS NULL
      ORDER BY
        el.employeeListName
    `)

  return result.recordset
}
