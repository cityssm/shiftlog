import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function addEmployeeListMember(
  employeeListId: number,
  employeeNumber: string,
  seniorityDate: string | undefined,
  seniorityOrderNumber: number
): Promise<boolean> {
  try {
    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('employeeListId', employeeListId)
      .input('employeeNumber', employeeNumber)
      .input('seniorityDate', seniorityDate ?? null)
      .input('seniorityOrderNumber', seniorityOrderNumber)
      .query(/* sql */ `
        INSERT INTO
          ShiftLog.EmployeeListMembers (
            employeeListId,
            instance,
            employeeNumber,
            seniorityDate,
            seniorityOrderNumber
          )
        VALUES
          (
            @employeeListId,
            @instance,
            @employeeNumber,
            @seniorityDate,
            @seniorityOrderNumber
          )
      `)

    return true
  } catch {
    return false
  }
}
