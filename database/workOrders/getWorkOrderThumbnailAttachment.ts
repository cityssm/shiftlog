import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderAttachment } from '../../types/record.types.js'

/**
 * Gets the thumbnail attachment for a work order.
 * @param workOrderId - The ID of the work order
 * @returns The thumbnail attachment if one exists, otherwise undefined
 */
export default async function getWorkOrderThumbnailAttachment(
  workOrderId: number | string
): Promise<WorkOrderAttachment | undefined> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .query<WorkOrderAttachment>(/* sql */ `
      SELECT
        TOP 1 workOrderAttachmentId,
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
        workOrderId = @workOrderId
        AND isWorkOrderThumbnail = 1
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
    `)

  return result.recordset[0]
}
