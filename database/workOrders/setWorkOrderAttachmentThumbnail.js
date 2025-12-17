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
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderAttachments
      set isWorkOrderThumbnail = 0,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
      where workOrderId = (
        select workOrderId
        from ShiftLog.WorkOrderAttachments
        where workOrderAttachmentId = @workOrderAttachmentId
      )
        and recordDelete_dateTime is null;

      update ShiftLog.WorkOrderAttachments
      set isWorkOrderThumbnail = 1,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
      where workOrderAttachmentId = @workOrderAttachmentId
        and recordDelete_dateTime is null;
    `);
    return true;
}
