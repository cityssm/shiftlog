import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Employee } from '../../types/record.types.js'

interface GetEmployeesFilters {
  isSupervisor?: boolean
}

export default async function getEmployees(
  filters?: GetEmployeesFilters
): Promise<Employee[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const result = (await pool
    .request()
    .input('isSupervisor', filters?.isSupervisor).query(/* sql */ `
      select employeeNumber, firstName, lastName,
        userName, isSupervisor,
        phoneNumber, phoneNumberAlternate, emailAddress,
        userGroupId,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      from ShiftLog.Employees
      where recordDelete_dateTime is null
        ${filters?.isSupervisor === undefined ? '' : `and isSupervisor = @isSupervisor`}
      order by lastName, firstName
  `)) as mssql.IResult<Employee>

  return result.recordset
}
