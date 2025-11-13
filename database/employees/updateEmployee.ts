import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export interface EmployeeUpdateFields {
  employeeNumber: string
  firstName: string
  lastName: string

  userName?: string | null
  isSupervisor?: boolean

  phoneNumber?: string | null
  phoneNumberAlternate?: string | null
  emailAddress?: string | null

  userGroupId?: number | null
}

export default async function updateEmployee(
  employeeFields: EmployeeUpdateFields,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const result = await pool
    .request()
    .input('employeeNumber', employeeFields.employeeNumber)
    .input('firstName', employeeFields.firstName)
    .input('lastName', employeeFields.lastName)
    .input('userName', employeeFields.userName ?? null)
    .input('isSupervisor', employeeFields.isSupervisor ?? false)
    .input('phoneNumber', employeeFields.phoneNumber ?? null)
    .input('phoneNumberAlternate', employeeFields.phoneNumberAlternate ?? null)
    .input('emailAddress', employeeFields.emailAddress ?? null)
    .input('userGroupId', employeeFields.userGroupId ?? null)
    .input('recordUpdate_userName', user.userName)
    .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.Employees
        set firstName = @firstName,
        lastName = @lastName,
        userName = @userName,
        isSupervisor = @isSupervisor,
        phoneNumber = @phoneNumber,
        phoneNumberAlternate = @phoneNumberAlternate,
        emailAddress = @emailAddress,
        userGroupId = @userGroupId,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime
      where employeeNumber = @employeeNumber
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
