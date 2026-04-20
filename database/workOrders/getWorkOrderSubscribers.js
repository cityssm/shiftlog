import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderSubscribers(workOrderId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderId', workOrderId)
        .query(`
      SELECT
        wos.workOrderId,
        wos.subscriberSequence,
        wos.subscriberEmailAddress
      FROM
        ShiftLog.WorkOrderSubscribers wos
        INNER JOIN ShiftLog.WorkOrders wo ON wos.workOrderId = wo.workOrderId
      WHERE
        wo.instance = @instance
        AND wo.recordDelete_dateTime IS NULL
        AND wos.recordDelete_dateTime IS NULL
        AND wos.workOrderId = @workOrderId
      ORDER BY
        wos.subscriberEmailAddress
    `);
    return result.recordset;
}
