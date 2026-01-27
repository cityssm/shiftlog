import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteWorkOrderTag(
  workOrderId: number,
  tagName: string
): Promise<boolean> {
  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool
      .request()
      .input('workOrderId', workOrderId)
      .input('tagName', tagName)
      .query(/* sql */ `
        DELETE FROM ShiftLog.WorkOrderTags
        WHERE
          workOrderId = @workOrderId
          AND tagName = @tagName
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
