import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function addShiftWorkOrder(
  shiftId: number | string,
  workOrderId: number | string,
  shiftWorkOrderNote: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('shiftId', shiftId)
    .input('workOrderId', workOrderId)
    .input('shiftWorkOrderNote', shiftWorkOrderNote)
    .query(/* sql */ `
      INSERT INTO
        ShiftLog.ShiftWorkOrders (shiftId, workOrderId, shiftWorkOrderNote)
      VALUES
        (@shiftId, @workOrderId, @shiftWorkOrderNote)
    `)

  return result.rowsAffected[0] > 0
}
