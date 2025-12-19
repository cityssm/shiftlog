import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function isWorkOrderOnShift(
  shiftId: number | string,
  workOrderId: number | string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('workOrderId', workOrderId).query(/* sql */ `
      select count(*) as recordCount
      from ShiftLog.ShiftWorkOrders
      where shiftId = @shiftId
        and workOrderId = @workOrderId
    `)) as mssql.IResult<{ recordCount: number }>

  return result.recordset[0].recordCount > 0
}
