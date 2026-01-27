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
  // Basic validation
  if (
    contactFields.phoneNumber !== undefined &&
    contactFields.phoneNumber !== null &&
    contactFields.phoneNumber.length > 20
  ) {
    return false
  }

  if (
    contactFields.phoneNumberAlternate !== undefined &&
    contactFields.phoneNumberAlternate !== null &&
    contactFields.phoneNumberAlternate.length > 20
  ) {
    return false
  }

  if (
    contactFields.emailAddress !== undefined &&
    contactFields.emailAddress !== null &&
    contactFields.emailAddress.length > 100
  ) {
    return false
  }

  const currentDate = new Date()

  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .input('phoneNumber', contactFields.phoneNumber)
    .input('phoneNumberAlternate', contactFields.phoneNumberAlternate)
    .input('emailAddress', contactFields.emailAddress)
    .input('recordUpdate_userName', user.userName)
    .input('recordUpdate_dateTime', currentDate)
    .query(/* sql */ `
      UPDATE ShiftLog.Employees
      SET
        phoneNumber = @phoneNumber,
        phoneNumberAlternate = @phoneNumberAlternate,
        emailAddress = @emailAddress,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime
      WHERE
        instance = @instance
        AND userName = @userName
        AND recordDelete_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
