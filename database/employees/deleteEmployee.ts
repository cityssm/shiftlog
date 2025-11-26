import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteEmployee(
  employeeNumber: string,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('employeeNumber', employeeNumber)
    .input('recordDelete_userName', user.userName)
    .input('recordDelete_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.Employees
        set recordDelete_userName = @recordDelete_userName,
        recordDelete_dateTime = @recordDelete_dateTime
      where instance = @instance
        and employeeNumber = @employeeNumber
        and recordDelete_dateTime is null
    `)

  return result.rowsAffected[0] > 0
}
