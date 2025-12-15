import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function addEmployeeList(
  employeeListFields: {
    employeeListName: string
    userGroupId: number | undefined
  },
  user: User
): Promise<number | undefined> {
  const currentDate = new Date()

  try {
    const pool = await mssqlPool.connect(
      getConfigProperty('connectors.shiftLog')
    )

    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('employeeListName', employeeListFields.employeeListName)
      .input('userGroupId', employeeListFields.userGroupId ?? undefined)
      .input('recordCreate_userName', user.userName)
      .input('recordCreate_dateTime', currentDate)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        insert into ShiftLog.EmployeeLists (
          instance, employeeListName, userGroupId,
          recordCreate_userName, recordCreate_dateTime,
          recordUpdate_userName, recordUpdate_dateTime
        )
        output inserted.employeeListId
        values (
          @instance, @employeeListName, @userGroupId,
          @recordCreate_userName, @recordCreate_dateTime,
          @recordUpdate_userName, @recordUpdate_dateTime
        )
      `)

    return result.recordset[0]?.employeeListId
  } catch {
    return undefined
  }
}
