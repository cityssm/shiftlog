import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface EmployeeContactFields {
  phoneNumber?: string | null
  phoneNumberAlternate?: string | null
  emailAddress?: string | null
}

export default async function updateEmployeeContactByUserName(
  userName: string,
  contactFields: EmployeeContactFields,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .input('phoneNumber', contactFields.phoneNumber ?? undefined)
    .input(
      'phoneNumberAlternate',
      contactFields.phoneNumberAlternate ?? undefined
    )
    .input('emailAddress', contactFields.emailAddress ?? undefined)
    .input('recordUpdate_userName', user.userName)
    .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.Employees
        set phoneNumber = @phoneNumber,
        phoneNumberAlternate = @phoneNumberAlternate,
        emailAddress = @emailAddress,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime
      where instance = @instance
        and userName = @userName
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
