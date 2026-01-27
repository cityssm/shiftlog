import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderCosts(workOrderId) {
    const pool = await getShiftLogConnectionPool();
    const result = (await pool
        .request()
        .input('workOrderId', workOrderId)
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT
        c.workOrderCostId,
        c.workOrderId,
        c.costAmount,
        c.costDescription,
        c.recordCreate_userName,
        c.recordCreate_dateTime,
        c.recordUpdate_userName,
        c.recordUpdate_dateTime
      FROM
        ShiftLog.WorkOrderCosts c
      WHERE
        c.workOrderId = @workOrderId
        AND c.recordDelete_dateTime IS NULL
        AND c.workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
      ORDER BY
        c.workOrderCostId
    `));
    return result.recordset;
}
