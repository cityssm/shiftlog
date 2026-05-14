import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function upsertIgnoredAttachmentChecksum(
  fileChecksum: string,
  noteText: string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('fileChecksum', fileChecksum)
    .input('instance', getConfigProperty('application.instance'))
    .input('noteText', noteText)
    .input('userName', userName)
    // eslint-disable-next-line no-secrets/no-secrets
    .query<{ success: boolean }>(/* sql */ `
      IF EXISTS (
        SELECT
          1
        FROM
          ShiftLog.IgnoredAttachmentChecksums
        WHERE
          instance = @instance
          AND fileChecksum = @fileChecksum
      ) BEGIN
      UPDATE ShiftLog.IgnoredAttachmentChecksums
      SET
        noteText = @noteText,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate(),
        recordDelete_userName = NULL,
        recordDelete_dateTime = NULL
      WHERE
        instance = @instance
        AND fileChecksum = @fileChecksum END ELSE BEGIN
      INSERT INTO
        ShiftLog.IgnoredAttachmentChecksums (
          instance,
          fileChecksum,
          noteText,
          recordCreate_userName,
          recordCreate_dateTime,
          recordUpdate_userName,
          recordUpdate_dateTime
        )
      VALUES
        (
          @instance,
          @fileChecksum,
          @noteText,
          @userName,
          getdate(),
          @userName,
          getdate()
        ) END
      SELECT
        CAST(1 AS BIT) AS success
    `)

  return result.recordset[0].success
}
