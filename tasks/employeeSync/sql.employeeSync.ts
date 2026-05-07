import mssqlMultiPool from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Employee } from '../../types/record.types.js'

export default async function getEmployees(): Promise<
  Array<Partial<Employee>> | undefined
> {
  const employeeConfig = getConfigProperty('employees')

  if (employeeConfig.syncSource !== 'sql') {
    return undefined
  }

  const sqlConfig = getConfigProperty('connectors.employeeSync')

  if (sqlConfig === undefined) {
    return undefined
  }

  const pool = await mssqlMultiPool.connect(sqlConfig)

  const sqlEmployees = await pool
    .request()
    .query<Partial<Employee>>(employeeConfig.sql)

  return sqlEmployees.recordset
}
