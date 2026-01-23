import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface WorkOrderTagWithColor {
  workOrderId: number

  tagName: string

  tagBackgroundColor?: string
  tagTextColor?: string
}

export default async function getWorkOrderTags(
  workOrderId: number | string
): Promise<WorkOrderTagWithColor[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderId', workOrderId).query<WorkOrderTagWithColor>(/* sql */ `
      SELECT
        wot.workOrderId, wot.tagName,
        t.tagBackgroundColor, t.tagTextColor
      FROM ShiftLog.WorkOrderTags wot
      left join ShiftLog.WorkOrders wo
        ON wot.workOrderId = wo.workOrderId
      LEFT JOIN ShiftLog.Tags t
        ON wot.tagName = t.tagName
        AND t.instance = @instance
        AND t.recordDelete_dateTime IS NULL
      WHERE
        wo.recordDelete_dateTime IS NULL
        AND wo.instance = @instance
        AND wot.workOrderId = @workOrderId
      ORDER BY wot.tagName
  `)

  return result.recordset as WorkOrderTagWithColor[]
}
