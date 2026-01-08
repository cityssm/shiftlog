import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
/**
 * Gets the thumbnail attachment for a work order.
 * @param workOrderId - The ID of the work order
 * @returns The thumbnail attachment if one exists, otherwise undefined
 */
export default async function getWorkOrderThumbnailAttachment(workOrderId) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      select top 1
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
      from ShiftLog.WorkOrderAttachments
      where workOrderId = @workOrderId
        and isWorkOrderThumbnail = 1
        and recordDelete_dateTime is null
        and workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
    `));
    return result.recordset[0];
}
