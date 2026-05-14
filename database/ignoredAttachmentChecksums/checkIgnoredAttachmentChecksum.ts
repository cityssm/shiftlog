import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function checkIgnoredAttachmentChecksum(
  fileChecksum: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('fileChecksum', fileChecksum)
    .input('instance', getConfigProperty('application.instance'))
    // eslint-disable-next-line no-secrets/no-secrets
    .query<{ fileChecksum: string }>(/* sql */ `
      SELECT
        TOP 1 fileChecksum
      FROM
        ShiftLog.IgnoredAttachmentChecksums
      WHERE
        fileChecksum = @fileChecksum
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `)

  return result.recordset.length > 0
}
