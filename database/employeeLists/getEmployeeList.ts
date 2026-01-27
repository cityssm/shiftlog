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
      SELECT
        el.employeeListId,
        el.employeeListName,
        el.userGroupId,
        ug.userGroupName,
        el.recordCreate_userName,
        el.recordCreate_dateTime,
        el.recordUpdate_userName,
        el.recordUpdate_dateTime
      FROM
        ShiftLog.EmployeeLists el
        LEFT JOIN ShiftLog.UserGroups ug ON el.userGroupId = ug.userGroupId
      WHERE
        el.instance = @instance
        AND el.employeeListId = @employeeListId
        AND el.recordDelete_dateTime IS NULL
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
      SELECT
        elm.employeeListId,
        elm.employeeNumber,
        e.firstName,
        e.lastName,
        elm.seniorityDate,
        elm.seniorityOrderNumber
      FROM
        ShiftLog.EmployeeListMembers elm
        LEFT JOIN ShiftLog.Employees e ON elm.instance = e.instance
        AND elm.employeeNumber = e.employeeNumber
        AND e.recordDelete_dateTime IS NULL
      WHERE
        elm.instance = @instance
        AND elm.employeeListId = @employeeListId
      ORDER BY
        elm.seniorityDate,
        elm.seniorityOrderNumber
    `)

  return {
    ...employeeList,
    members: membersResult.recordset
  }
}
