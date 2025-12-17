import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderAttachment } from '../../types/record.types.js'

export default async function getWorkOrderAttachment(
  workOrderAttachmentId: number | string
): Promise<WorkOrderAttachment | undefined> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('workOrderAttachmentId', workOrderAttachmentId)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      select
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
      where workOrderAttachmentId = @workOrderAttachmentId
        and recordDelete_dateTime is null
        and workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
    `)) as mssql.IResult<WorkOrderAttachment>

  return result.recordset[0]
}
