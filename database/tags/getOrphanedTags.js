import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
/**
 * Get tags that exist in WorkOrderTags but not in the Tags system table.
 * These are ad-hoc tags that have been applied to work orders but don't have
 * system-defined colors.
 */
export default async function getOrphanedTags() {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT wot.tagName, COUNT(*) as usageCount
      FROM ShiftLog.WorkOrderTags wot
      INNER JOIN ShiftLog.WorkOrders w ON wot.workOrderId = w.workOrderId AND w.instance = @instance AND w.recordDelete_dateTime IS NULL
      LEFT JOIN ShiftLog.Tags t ON wot.tagName = t.tagName AND t.instance = @instance AND t.recordDelete_dateTime IS NULL
      WHERE t.tagName IS NULL
      GROUP BY wot.tagName
      ORDER BY COUNT(*) DESC, wot.tagName
    `);
    return result.recordset;
}
