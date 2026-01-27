import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteEmployeeListMember(
  employeeListId: number,
  employeeNumber: string
): Promise<boolean> {
  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('employeeListId', employeeListId)
      .input('employeeNumber', employeeNumber)
      .query(/* sql */ `
        DELETE FROM ShiftLog.EmployeeListMembers
        WHERE
          instance = @instance
          AND employeeListId = @employeeListId
          AND employeeNumber = @employeeNumber
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
