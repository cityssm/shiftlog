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
        wos.subscriberEmailAddress,
        e.firstName,
        e.lastName,
        e.phoneNumber,
        e.phoneNumberAlternate
      FROM
        ShiftLog.WorkOrderSubscribers wos
        INNER JOIN ShiftLog.WorkOrders wo ON wos.workOrderId = wo.workOrderId
        LEFT JOIN ShiftLog.Employees e ON wo.instance = e.instance
        AND wos.subscriberEmailAddress = e.emailAddress
        AND e.recordDelete_dateTime IS NULL
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
