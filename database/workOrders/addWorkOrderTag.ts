import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function addWorkOrderTag(
  workOrderId: number,
  tagName: string
): Promise<boolean> {
  try {
    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('workOrderId', workOrderId)
      .input('tagName', tagName)
      .query(/* sql */ `
        INSERT INTO
          ShiftLog.WorkOrderTags (workOrderId, tagName)
        VALUES
          (@workOrderId, @tagName)
      `)

    return true
  } catch {
    return false
  }
}
