import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderAttachmentsByChecksums(fileChecksums) {
    if (fileChecksums.length === 0) {
        return new Map();
    }
    const pool = await getShiftLogConnectionPool();
    const request = pool
        .request()
        .input('instance', getConfigProperty('application.instance'));
    const parameterNames = [];
    for (const [index, checksum] of fileChecksums.entries()) {
        const parameterName = `checksum${index}`;
        request.input(parameterName, checksum);
        parameterNames.push(`@${parameterName}`);
    }
    const result = await request.query(`
    SELECT
      workOrderAttachmentId,
      workOrderId,
      attachmentFileName,
      attachmentFileType,
      attachmentFileSizeInBytes,
      attachmentDescription,
      isWorkOrderThumbnail,
      fileSystemPath,
      fileChecksum,
      accessKey,
      recordCreate_userName,
      recordCreate_dateTime,
      recordUpdate_userName,
      recordUpdate_dateTime,
      recordDelete_userName,
      recordDelete_dateTime
    FROM
      ShiftLog.WorkOrderAttachments
    WHERE
      fileChecksum IN (${parameterNames.join(', ')})
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
      fileChecksum,
      recordCreate_dateTime DESC
  `);
    const attachmentMap = new Map();
    for (const attachment of result.recordset) {
        if (!attachmentMap.has(attachment.fileChecksum)) {
            attachmentMap.set(attachment.fileChecksum, attachment);
        }
    }
    return attachmentMap;
}
