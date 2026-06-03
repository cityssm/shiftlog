import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderAttachment } from '../../types/record.types.js'

export default async function getWorkOrderAttachments(
  workOrderId: number | string
): Promise<WorkOrderAttachment[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    // eslint-disable-next-line no-secrets/no-secrets
    .query<WorkOrderAttachment>(/* sql */ `
      SELECT
        workOrderAttachmentId,
        workOrderId,
        attachmentFileName,
        attachmentFileType,
        attachmentFileSizeInBytes,
        attachmentDescription,
        isWorkOrderThumbnail,
        fileSystemPath,
        wao.fileChecksum,
        wao.accessKey,
        iac.noteText AS ignoredAttachmentNoteText,
        wao.recordCreate_userName,
        wao.recordCreate_dateTime,
        wao.recordUpdate_userName,
        wao.recordUpdate_dateTime,
        wao.recordDelete_userName,
        wao.recordDelete_dateTime
      FROM
        ShiftLog.WorkOrderAttachments wao
        LEFT OUTER JOIN ShiftLog.IgnoredAttachmentChecksums iac ON wao.fileChecksum = iac.fileChecksum
        AND iac.instance = @instance
        AND iac.recordDelete_dateTime IS NULL
      WHERE
        wao.workOrderId = @workOrderId
        AND wao.recordDelete_dateTime IS NULL
        AND wao.workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
      ORDER BY
        wao.recordCreate_dateTime DESC
    `)

  return result.recordset
}
