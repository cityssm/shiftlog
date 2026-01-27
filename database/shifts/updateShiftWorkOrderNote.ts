import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function updateShiftWorkOrderNote(
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
      UPDATE ShiftLog.ShiftWorkOrders
      SET
        shiftWorkOrderNote = @shiftWorkOrderNote
      WHERE
        shiftId = @shiftId
        AND workOrderId = @workOrderId
    `)

  return result.rowsAffected[0] > 0
}
