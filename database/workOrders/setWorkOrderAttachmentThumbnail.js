import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function setWorkOrderAttachmentThumbnail(workOrderAttachmentId, userName) {
    const pool = await getShiftLogConnectionPool();
    await pool
        .request()
        .input('workOrderAttachmentId', workOrderAttachmentId)
        .input('userName', userName)
        .query(`
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
