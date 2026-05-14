import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { IgnoredAttachmentChecksum } from '../../types/record.types.js'

export default async function getIgnoredAttachmentChecksums(): Promise<
  IgnoredAttachmentChecksum[]
> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .query<IgnoredAttachmentChecksum>(/* sql */ `
      SELECT
        fileChecksum,
        noteText,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime
      FROM
        ShiftLog.IgnoredAttachmentChecksums
      WHERE
        recordDelete_dateTime IS NULL
      ORDER BY
        recordUpdate_dateTime DESC
    `)

  return result.recordset
}
