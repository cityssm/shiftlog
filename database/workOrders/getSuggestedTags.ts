import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface SuggestedTag {
  tagName: string
  tagBackgroundColor?: string
  tagTextColor?: string
  usageCount: number
}

export default async function getSuggestedTags(
  workOrderId: number | string,
  limit: number = 10
): Promise<SuggestedTag[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderId', workOrderId)
    .input('limit', limit)
    .query<SuggestedTag>(/* sql */ `
      SELECT TOP (@limit)
        wot.tagName,
        t.tagBackgroundColor,
        t.tagTextColor,
        COUNT(*) as usageCount
      FROM
        ShiftLog.WorkOrderTags wot
        LEFT JOIN ShiftLog.Tags t ON wot.tagName = t.tagName
          AND t.instance = @instance
          AND t.recordDelete_dateTime IS NULL
        INNER JOIN ShiftLog.WorkOrders wo ON wot.workOrderId = wo.workOrderId
      WHERE
        wo.instance = @instance
        AND wo.recordDelete_dateTime IS NULL
        AND wot.tagName NOT IN (
          SELECT tagName
          FROM ShiftLog.WorkOrderTags
          WHERE workOrderId = @workOrderId
        )
      GROUP BY
        wot.tagName,
        t.tagBackgroundColor,
        t.tagTextColor
      ORDER BY
        COUNT(*) DESC,
        wot.tagName
    `)

  return result.recordset as SuggestedTag[]
}
