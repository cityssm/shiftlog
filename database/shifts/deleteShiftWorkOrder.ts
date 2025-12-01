import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteShiftWorkOrder(
  shiftId: number | string,
  workOrderId: number | string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('workOrderId', workOrderId).query(/* sql */ `
      delete from ShiftLog.ShiftWorkOrders
      where shiftId = @shiftId
        and workOrderId = @workOrderId
    `)) as mssql.IResult<Record<string, never>>

  return result.rowsAffected[0] > 0
}
