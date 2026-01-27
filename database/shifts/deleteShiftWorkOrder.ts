import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteShiftWorkOrder(
  shiftId: number | string,
  workOrderId: number | string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('shiftId', shiftId)
    .input('workOrderId', workOrderId)
    .query(/* sql */ `
      DELETE FROM ShiftLog.ShiftWorkOrders
      WHERE
        shiftId = @shiftId
        AND workOrderId = @workOrderId
    `)

  return result.rowsAffected[0] > 0
}
