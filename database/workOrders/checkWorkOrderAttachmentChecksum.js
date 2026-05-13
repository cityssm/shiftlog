import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function checkWorkOrderAttachmentChecksum(workOrderId, fileChecksum) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('fileChecksum', fileChecksum)
        .input('instance', getConfigProperty('application.instance'))
        .query(`
      SELECT
        TOP 1 workOrderAttachmentId
      FROM
        ShiftLog.WorkOrderAttachments
      WHERE
        workOrderId = @workOrderId
        AND fileChecksum = @fileChecksum
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
    return result.recordset.length > 0;
}
