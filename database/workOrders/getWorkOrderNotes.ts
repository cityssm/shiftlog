import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface WorkOrderNote {
  workOrderId: number
  noteSequence: number
  noteText: string
  recordCreate_dateTime: Date
  recordCreate_userName: string
  recordUpdate_dateTime: Date
  recordUpdate_userName: string
  recordDelete_dateTime?: Date | null
  recordDelete_userName?: string | null
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
      SELECT
        workOrderId,
        noteSequence,
        noteText,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime,
        recordDelete_userName,
        recordDelete_dateTime
      FROM
        ShiftLog.WorkOrderNotes
      WHERE
        workOrderId = @workOrderId
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
        noteSequence DESC
    `)) as mssql.IResult<WorkOrderNote>

  return result.recordset
}
