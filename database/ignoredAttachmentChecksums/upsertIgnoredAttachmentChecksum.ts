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
          fileChecksum = @fileChecksum
      )
      BEGIN
        UPDATE ShiftLog.IgnoredAttachmentChecksums
        SET
          noteText = @noteText,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate(),
          recordDelete_userName = NULL,
          recordDelete_dateTime = NULL
        WHERE
          fileChecksum = @fileChecksum
      END
      ELSE
      BEGIN
        INSERT INTO
          ShiftLog.IgnoredAttachmentChecksums (
            fileChecksum,
            noteText,
            recordCreate_userName,
            recordCreate_dateTime,
            recordUpdate_userName,
            recordUpdate_dateTime
          )
        VALUES
          (
            @fileChecksum,
            @noteText,
            @userName,
            getdate(),
            @userName,
            getdate()
          )
      END

      SELECT CAST(1 AS bit) AS success
    `)

  return result.recordset[0].success
}
