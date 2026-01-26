import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type {
  EmployeeList,
  EmployeeListMember
} from '../../types/record.types.js'

export interface EmployeeListWithMembers extends EmployeeList {
  members: EmployeeListMember[]
}

export default async function getEmployeeList(
  employeeListId: number
): Promise<EmployeeListWithMembers | undefined> {
  const pool = await getShiftLogConnectionPool()

  // Get the employee list
  const listResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('employeeListId', employeeListId)
    .query<EmployeeList>(/* sql */ `
      select el.employeeListId, el.employeeListName,
        el.userGroupId,
        ug.userGroupName,
        el.recordCreate_userName, el.recordCreate_dateTime,
        el.recordUpdate_userName, el.recordUpdate_dateTime
      from ShiftLog.EmployeeLists el
      left join ShiftLog.UserGroups ug on el.userGroupId = ug.userGroupId
      where
        el.instance = @instance
        and el.employeeListId = @employeeListId
        and el.recordDelete_dateTime is null
    `)

  if (listResult.recordset.length === 0) {
    return undefined
  }

  const employeeList = listResult.recordset[0]

  // Get the members
  const membersResult = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('employeeListId', employeeListId)
    .query<EmployeeListMember>(/* sql */ `
      select elm.employeeListId, elm.employeeNumber,
        e.firstName, e.lastName,
        elm.seniorityDate, elm.seniorityOrderNumber
      from ShiftLog.EmployeeListMembers elm
      left join ShiftLog.Employees e on
        elm.instance = e.instance and
        elm.employeeNumber = e.employeeNumber and
        e.recordDelete_dateTime is null
      where
        elm.instance = @instance
        and elm.employeeListId = @employeeListId
      order by elm.seniorityDate, elm.seniorityOrderNumber
    `)

  return {
    ...employeeList,
    members: membersResult.recordset
  }
}
