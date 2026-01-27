import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function getMaximumEquipmentRecordSyncDateTime(): Promise<
  Date | undefined
> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      SELECT
        max(recordSync_dateTime) AS maxRecordSyncDateTime
      FROM
        ShiftLog.Equipment
      WHERE
        instance = @instance
        AND recordSync_isSynced = 1
    `)) as mssql.IResult<{
    maxRecordSyncDateTime: Date | null
  }>

  if (
    result.recordset.length === 0 ||
    result.recordset[0].maxRecordSyncDateTime === null
  ) {
    return undefined
  }

  return result.recordset[0].maxRecordSyncDateTime
}
