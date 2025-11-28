import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function deleteWorkOrderAttachment(workOrderAttachmentId, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('workOrderAttachmentId', workOrderAttachmentId)
        .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrderAttachments
      set recordDelete_userName = @userName,
          recordDelete_dateTime = getdate()
      where workOrderAttachmentId = @workOrderAttachmentId
        and recordDelete_dateTime is null
    `);
    return result.rowsAffected[0] === 1;
}
