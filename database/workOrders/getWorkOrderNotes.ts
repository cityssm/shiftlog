import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface WorkOrderNote {
  workOrderId: number
  noteSequence: number
  noteText: string
  recordCreate_userName: string
  recordCreate_dateTime: Date
  recordUpdate_userName: string
  recordUpdate_dateTime: Date
  recordDelete_userName?: string | null
  recordDelete_dateTime?: Date | null
}

export default async function getWorkOrderNotes(
  workOrderId: number | string
): Promise<WorkOrderNote[]> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      select
        workOrderId,
        noteSequence,
        noteText,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime,
        recordDelete_userName,
        recordDelete_dateTime
      from ShiftLog.WorkOrderNotes
      where workOrderId = @workOrderId
        and recordDelete_dateTime is null
        and workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
      order by noteSequence desc
    `)) as mssql.IResult<WorkOrderNote>

  return result.recordset
}
