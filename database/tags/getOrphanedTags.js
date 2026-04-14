import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getOrphanedTags() {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(`
      SELECT
        wot.tagName,
        COUNT(*) AS usageCount
      FROM
        ShiftLog.WorkOrderTags wot
        INNER JOIN ShiftLog.WorkOrders w ON wot.workOrderId = w.workOrderId
        AND w.instance = @instance
        AND w.recordDelete_dateTime IS NULL
        LEFT JOIN ShiftLog.Tags t ON wot.tagName = t.tagName
        AND t.instance = @instance
        AND t.recordDelete_dateTime IS NULL
      WHERE
        t.tagName IS NULL
      GROUP BY
        wot.tagName
      ORDER BY
        COUNT(*) DESC,
        wot.tagName
    `);
    return result.recordset;
}
