import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteIgnoredAttachmentChecksum(
  fileChecksum: string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('fileChecksum', fileChecksum)
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.IgnoredAttachmentChecksums
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate(),
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        fileChecksum = @fileChecksum
        AND recordDelete_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
