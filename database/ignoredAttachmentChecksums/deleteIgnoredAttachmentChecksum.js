import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
export default async function deleteIgnoredAttachmentChecksum(
  fileChecksum,
  userName
) {
  const pool = await getShiftLogConnectionPool()
  const result = await pool
    .request()
    .input('fileChecksum', fileChecksum)
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName).query(`
      UPDATE ShiftLog.IgnoredAttachmentChecksums
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate(),
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        instance = @instance
        AND fileChecksum = @fileChecksum
        AND recordDelete_dateTime IS NULL
    `)
  return result.rowsAffected[0] > 0
}
