import mssqlPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function updateEmployeeListMember(
  employeeListId: number,
  employeeNumber: string,
  seniorityDate: string | undefined,
  seniorityOrderNumber: number
): Promise<boolean> {
  try {
    const pool = await mssqlPool.connect(
      getConfigProperty('connectors.shiftLog')
    )

    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('employeeListId', employeeListId)
      .input('employeeNumber', employeeNumber)
      .input('seniorityDate', seniorityDate ?? null)
      .input('seniorityOrderNumber', seniorityOrderNumber).query(/* sql */ `
        update ShiftLog.EmployeeListMembers
        set seniorityDate = @seniorityDate,
          seniorityOrderNumber = @seniorityOrderNumber
        where employeeListId = @employeeListId
          and employeeNumber = @employeeNumber
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
