import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { EmployeeList } from '../../types/record.types.js'

export default async function getEmployeeLists(): Promise<EmployeeList[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<EmployeeList>(/* sql */ `
      select el.employeeListId, el.employeeListName,
        el.userGroupId,
        ug.userGroupName,
        (select count(*) from ShiftLog.EmployeeListMembers elm
          where elm.employeeListId = el.employeeListId) as memberCount,
        el.recordCreate_userName, el.recordCreate_dateTime,
        el.recordUpdate_userName, el.recordUpdate_dateTime
      from ShiftLog.EmployeeLists el
      left join ShiftLog.UserGroups ug on el.userGroupId = ug.userGroupId
      where
        el.instance = @instance
        and el.recordDelete_dateTime is null
      order by el.employeeListName
    `)

  return result.recordset
}
