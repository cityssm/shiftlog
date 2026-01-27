import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderAttachment(workOrderAttachmentId) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('workOrderAttachmentId', workOrderAttachmentId)
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT
        workOrderAttachmentId,
        workOrderId,
        attachmentFileName,
        attachmentFileType,
        attachmentFileSizeInBytes,
        attachmentDescription,
        isWorkOrderThumbnail,
        fileSystemPath,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime,
        recordDelete_userName,
        recordDelete_dateTime
      FROM
        ShiftLog.WorkOrderAttachments
      WHERE
        workOrderAttachmentId = @workOrderAttachmentId
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
    `));
    return result.recordset[0];
}
