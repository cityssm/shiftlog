import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderAttachment } from '../../types/record.types.js'

export default async function getWorkOrderAttachments(
  workOrderId: number | string
): Promise<WorkOrderAttachment[]> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      select
        workOrderAttachmentId,
        workOrderId,
        attachmentFileName,
        attachmentFileType,
        attachmentFileSizeInBytes,
        attachmentDescription,
        fileSystemPath,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime,
        recordDelete_userName,
        recordDelete_dateTime
      from ShiftLog.WorkOrderAttachments
      where workOrderId = @workOrderId
        and recordDelete_dateTime is null
        and workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
      order by recordCreate_dateTime desc
    `)) as mssql.IResult<WorkOrderAttachment>

  return result.recordset
}
