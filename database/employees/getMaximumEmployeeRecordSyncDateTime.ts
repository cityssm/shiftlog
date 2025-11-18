import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function getMaximumEmployeeRecordSyncDateTime(): Promise<
  Date | undefined
> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool.request()
    .query(/* sql */ `select max(recordSync_dateTime) as maxRecordSyncDateTime
      from Employees
      where recordSync_isSynced = 1`)) as mssql.IResult<{
    maxRecordSyncDateTime: Date | null
  }>

  if (
    result.recordset.length === 0 ||
    !result.recordset[0].maxRecordSyncDateTime
  ) {
    return undefined
  }

  return result.recordset[0].maxRecordSyncDateTime
}
