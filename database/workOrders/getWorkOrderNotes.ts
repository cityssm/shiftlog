// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, unicorn/no-null */

import type { mssql } from '@cityssm/mssql-multi-pool'

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

  const result = (await pool.request().input('workOrderId', workOrderId)
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
      order by noteSequence desc
    `)) as mssql.IResult<WorkOrderNote>

  return result.recordset
}
