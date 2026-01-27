import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface EmployeeUpdateFields {
  emailAddress?: string | null
  employeeNumber: string
  firstName: string
  isSupervisor?: boolean
  recordSync_isSynced?: boolean
  lastName: string
  phoneNumber?: string | null
  phoneNumberAlternate?: string | null
  userGroupId?: number | null
  userName?: string | null
}

export default async function updateEmployee(
  employeeFields: EmployeeUpdateFields,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('employeeNumber', employeeFields.employeeNumber)
    .input('firstName', employeeFields.firstName)
    .input('lastName', employeeFields.lastName)
    .input('userName', employeeFields.userName ?? undefined)
    .input('isSupervisor', employeeFields.isSupervisor ?? false)
    .input('phoneNumber', employeeFields.phoneNumber ?? undefined)
    .input(
      'phoneNumberAlternate',
      employeeFields.phoneNumberAlternate ?? undefined
    )
    .input('emailAddress', employeeFields.emailAddress ?? undefined)
    .input('userGroupId', employeeFields.userGroupId ?? undefined)
    .input('recordSync_isSynced', employeeFields.recordSync_isSynced ?? false)
    .input('recordUpdate_userName', user.userName)
    .input('recordUpdate_dateTime', currentDate)
    .query(/* sql */ `
      UPDATE ShiftLog.Employees
      SET
        firstName = @firstName,
        lastName = @lastName,
        userName = @userName,
        isSupervisor = @isSupervisor,
        phoneNumber = @phoneNumber,
        phoneNumberAlternate = @phoneNumberAlternate,
        emailAddress = @emailAddress,
        userGroupId = @userGroupId,
        recordSync_isSynced = @recordSync_isSynced,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime
      WHERE
        instance = @instance
        AND employeeNumber = @employeeNumber
        AND recordDelete_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
