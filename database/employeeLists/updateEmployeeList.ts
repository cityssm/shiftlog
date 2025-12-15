import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function updateEmployeeList(
  employeeListFields: {
    employeeListId: number
    employeeListName: string
    userGroupId: number | undefined
  },
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await mssqlPool.connect(
      getConfigProperty('connectors.shiftLog')
    )

    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('employeeListId', employeeListFields.employeeListId)
      .input('employeeListName', employeeListFields.employeeListName)
      .input('userGroupId', employeeListFields.userGroupId ?? undefined)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        update ShiftLog.EmployeeLists
        set employeeListName = @employeeListName,
          userGroupId = @userGroupId,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        where instance = @instance
          and employeeListId = @employeeListId
          and recordDelete_dateTime is null
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
