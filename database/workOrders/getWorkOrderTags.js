import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderTags(workOrderId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderId', workOrderId)
        .query(/* sql */ `
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
        case when t.tagBackgroundColor is null then 1 else 0 end,
        wot.tagName
    `);
    return result.recordset;
}
