import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderAttachments(workOrderId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('instance', getConfigProperty('application.instance'))
        .query(`
      SELECT
        workOrderAttachmentId,
        workOrderId,
        attachmentFileName,
        attachmentFileType,
        attachmentFileSizeInBytes,
        attachmentDescription,
        isWorkOrderThumbnail,
        fileSystemPath,
        wao.fileChecksum,
        iac.noteText AS ignoredAttachmentNoteText,
        wao.recordCreate_userName,
        wao.recordCreate_dateTime,
        wao.recordUpdate_userName,
        wao.recordUpdate_dateTime,
        wao.recordDelete_userName,
        wao.recordDelete_dateTime
      FROM
        ShiftLog.WorkOrderAttachments wao
        LEFT OUTER JOIN ShiftLog.IgnoredAttachmentChecksums iac ON
          wao.fileChecksum = iac.fileChecksum
          AND iac.recordDelete_dateTime IS NULL
      WHERE
        wao.workOrderId = @workOrderId
        AND wao.recordDelete_dateTime IS NULL
        AND wao.workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
      ORDER BY
        wao.recordCreate_dateTime DESC
    `);
    return result.recordset;
}
