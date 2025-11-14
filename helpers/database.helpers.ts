import mssqlMultiPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from './config.helpers.js'

export async function getShiftLogConnectionPool(): Promise<mssql.ConnectionPool> {
  const pool = await mssqlMultiPool.connect(
    getConfigProperty('connectors.shiftLog')
  )
  return pool
}
