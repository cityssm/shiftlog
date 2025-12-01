import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function addShiftWorkOrder(
  shiftId: number | string,
  workOrderId: number | string,
  shiftWorkOrderNote: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('workOrderId', workOrderId)
    .input('shiftWorkOrderNote', shiftWorkOrderNote).query(/* sql */ `
      insert into ShiftLog.ShiftWorkOrders (shiftId, workOrderId, shiftWorkOrderNote)
      values (@shiftId, @workOrderId, @shiftWorkOrderNote)
    `)) as mssql.IResult<Record<string, never>>

  return result.rowsAffected[0] > 0
}
