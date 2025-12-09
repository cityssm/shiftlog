import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderTags(workOrderId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderId', workOrderId)
        .query(/* sql */ `
    SELECT wot.workOrderId, wot.tagName,
           t.tagBackgroundColor, t.tagTextColor
    FROM ShiftLog.WorkOrderTags wot
    LEFT JOIN ShiftLog.Tags t ON wot.tagName = t.tagName AND t.instance = @instance AND t.recordDelete_dateTime IS NULL
    WHERE wot.workOrderId = @workOrderId
    ORDER BY wot.tagName
  `);
    return result.recordset;
}
