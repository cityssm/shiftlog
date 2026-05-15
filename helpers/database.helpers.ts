import mssqlMultiPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from './config.helpers.js'

export async function getShiftLogConnectionPool(): Promise<mssql.ConnectionPool> {
  const pool = await mssqlMultiPool.connect(
    getConfigProperty('connectors.shiftLog')
  )
  return pool
}

export function buildGreatestSql(columnNames: string[], alias: string): string {
  // Build the GREATEST function for SQL Server using IIF statements
  // Handle the case where dates are null by treating null as the smallest possible value

  if (columnNames.length === 0) {
    return ''
  }

  if (columnNames.length === 1) {
    return `${columnNames[0]} AS ${alias}`
  }

  let greatestSql = /* sql */ `
    CASE
      WHEN ${columnNames[0]} IS NULL THEN ${columnNames[1]}
      WHEN ${columnNames[1]} IS NULL THEN ${columnNames[0]}
      WHEN ${columnNames[0]} >= ${columnNames[1]} THEN ${columnNames[0]}
      ELSE ${columnNames[1]}
    END
  `

  for (let index = 2; index < columnNames.length; index += 1) {
    greatestSql = /* sql */ `
      CASE
        WHEN ${columnNames[index]} IS NULL THEN ${greatestSql}
        WHEN ${greatestSql} IS NULL THEN ${columnNames[index]}
        WHEN ${columnNames[index]} >= ${greatestSql} THEN ${columnNames[index]}
        ELSE ${greatestSql}
      END
    `
  }

  return `${greatestSql} AS ${alias}`
}
