import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
const defaultLimit = 10;
export default async function getSuggestedTags(workOrderId, limit = defaultLimit) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderId', workOrderId)
        .input('limit', limit)
        .query(`
      SELECT
        TOP (@limit) wot.tagName,
        t.tagBackgroundColor,
        t.tagTextColor,
        COUNT(*) AS usageCount
      FROM
        ShiftLog.WorkOrderTags wot
        LEFT JOIN ShiftLog.Tags t ON wot.tagName = t.tagName
        AND t.instance = @instance
        AND t.recordDelete_dateTime IS NULL
        INNER JOIN ShiftLog.WorkOrders wo ON wot.workOrderId = wo.workOrderId
        LEFT JOIN ShiftLog.WorkOrders currentWo ON currentWo.workOrderId = @workOrderId
      WHERE
        wo.instance = @instance
        AND wo.recordDelete_dateTime IS NULL
        AND wot.tagName NOT IN (
          SELECT
            tagName
          FROM
            ShiftLog.WorkOrderTags
          WHERE
            workOrderId = @workOrderId
        )
      GROUP BY
        wot.tagName,
        t.tagBackgroundColor,
        t.tagTextColor,
        currentWo.workOrderDetails
      ORDER BY
        CASE
          WHEN currentWo.workOrderDetails LIKE '%' + wot.tagName + '%' THEN 0
          ELSE 1
        END,
        COUNT(*) DESC,
        wot.tagName
    `);
    return result.recordset;
}
