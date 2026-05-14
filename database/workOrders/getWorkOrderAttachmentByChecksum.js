import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderAttachmentByChecksum(fileChecksum) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('fileChecksum', fileChecksum)
        .input('instance', getConfigProperty('application.instance'))
        .query(`
      SELECT TOP 1
        workOrderAttachmentId,
        workOrderId,
        attachmentFileName,
        attachmentFileType,
        attachmentFileSizeInBytes,
        attachmentDescription,
        isWorkOrderThumbnail,
        fileSystemPath,
        fileChecksum,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime,
        recordDelete_userName,
        recordDelete_dateTime
      FROM
        ShiftLog.WorkOrderAttachments
      WHERE
        fileChecksum = @fileChecksum
        AND recordDelete_dateTime IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
      ORDER BY
        recordCreate_dateTime DESC
    `);
    return result.recordset[0];
}
