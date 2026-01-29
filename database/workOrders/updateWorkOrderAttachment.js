import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateWorkOrderAttachment(updateWorkOrderAttachmentForm, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderAttachmentId', updateWorkOrderAttachmentForm.workOrderAttachmentId)
        .input('attachmentDescription', updateWorkOrderAttachmentForm.attachmentDescription)
        .input('userName', userName)
        .query(/* sql */ `
      UPDATE ShiftLog.WorkOrderAttachments
      SET
        attachmentDescription = @attachmentDescription,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
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
    `);
    return result.rowsAffected[0] > 0;
}
