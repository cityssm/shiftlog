import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Employee } from '../../types/record.types.js'

export default async function getEmployees(): Promise<Employee[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const result = (await pool.request().query(/* sql */ `
    select employeeNumber, firstName, lastName,
      userName, isSupervisor,
      phoneNumber, phoneNumberAlternate, emailAddress,
      userGroupId,
      recordCreate_userName, recordCreate_dateTime,
      recordUpdate_userName, recordUpdate_dateTime
    from ShiftLog.Employees
    where recordDelete_dateTime is null
    order by lastName, firstName
  `)) as mssql.IResult<Employee>

  return result.recordset
}
