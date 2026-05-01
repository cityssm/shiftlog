import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderTag } from '../../types/record.types.js'

export default async function getWorkOrderTags(
  workOrderId: number | string
): Promise<WorkOrderTag[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderId', workOrderId)
    .query<WorkOrderTag>(/* sql */ `
      SELECT
        wot.workOrderId,
        wot.tagName,
        t.tagBackgroundColor,
        t.tagTextColor
      FROM
        ShiftLog.WorkOrderTags wot
        LEFT JOIN ShiftLog.WorkOrders wo ON wot.workOrderId = wo.workOrderId
        LEFT JOIN ShiftLog.Tags t ON wot.tagName = t.tagName
        AND t.instance = @instance
        AND t.recordDelete_dateTime IS NULL
      WHERE
        wo.recordDelete_dateTime IS NULL
        AND wo.instance = @instance
        AND wot.workOrderId = @workOrderId
      ORDER BY
        CASE
          WHEN t.tagBackgroundColor IS NULL THEN 1
          ELSE 0
        END,
        wot.tagName
    `)

  return result.recordset as WorkOrderTag[]
}
