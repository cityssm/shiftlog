import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function ignoreWorkOrderAttachment(workOrderAttachmentId, noteText, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('noteText', noteText)
        .input('userName', userName)
        .input('workOrderAttachmentId', workOrderAttachmentId)
        .query(`
      DECLARE @fileChecksum CHAR(64)

      SELECT
        @fileChecksum = wao.fileChecksum
      FROM
        ShiftLog.WorkOrderAttachments wao
        INNER JOIN ShiftLog.WorkOrders wo ON
          wao.workOrderId = wo.workOrderId
      WHERE
        wao.workOrderAttachmentId = @workOrderAttachmentId
        AND wao.recordDelete_dateTime IS NULL
        AND wo.instance = @instance
        AND wo.recordDelete_dateTime IS NULL

      IF @fileChecksum IS NULL OR @fileChecksum = ''
      BEGIN
        SELECT CAST(0 AS bit) AS success
        RETURN
      END

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
    `);
    return result.recordset[0].success;
}
