import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
/**
 * Sets an attachment as the thumbnail for a work order.
 * This will clear any existing thumbnail for the work order and set the new one.
 * @param workOrderAttachmentId - The ID of the attachment to set as thumbnail
 * @param userName - The username of the user making the change
 * @returns True if successful
 */
export default async function setWorkOrderAttachmentThumbnail(workOrderAttachmentId, userName) {
    const pool = await getShiftLogConnectionPool();
    // First, clear all thumbnails for this work order
    // Then set the new thumbnail
    await pool
        .request()
        .input('workOrderAttachmentId', workOrderAttachmentId)
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.WorkOrderAttachments
      SET
        isWorkOrderThumbnail = 0,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        workOrderId = (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrderAttachments
          WHERE
            workOrderAttachmentId = @workOrderAttachmentId
        )
        AND recordDelete_dateTime IS NULL;

      UPDATE ShiftLog.WorkOrderAttachments
      SET
        isWorkOrderThumbnail = 1,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      WHERE
        workOrderAttachmentId = @workOrderAttachmentId
        AND recordDelete_dateTime IS NULL;
    `);
    return true;
}
