import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function getMaximumEquipmentRecordSyncDateTime(): Promise<
  Date | undefined
> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<{
      maxRecordSyncDateTime: Date | null
    }>(/* sql */ `
      SELECT
        max(recordSync_dateTime) AS maxRecordSyncDateTime
      FROM
        ShiftLog.Equipment
      WHERE
        instance = @instance
        AND recordSync_isSynced = 1
    `)

  if (
    result.recordset.length === 0 ||
    result.recordset[0].maxRecordSyncDateTime === null
  ) {
    return undefined
  }

  return result.recordset[0].maxRecordSyncDateTime
}
