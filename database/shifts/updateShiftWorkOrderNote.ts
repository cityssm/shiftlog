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
    .input('shiftWorkOrderNote', shiftWorkOrderNote).query(/* sql */ `
      update ShiftLog.ShiftWorkOrders
      set shiftWorkOrderNote = @shiftWorkOrderNote
      where shiftId = @shiftId
        and workOrderId = @workOrderId
    `)

  return result.rowsAffected[0] > 0
}
