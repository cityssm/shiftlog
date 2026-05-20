import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import getWorkOrder from './getWorkOrder.js';
export default async function addWorkOrderTag(workOrderId, tagName) {
    try {
        const workOrder = await getWorkOrder(workOrderId);
        if (workOrder === undefined) {
            return false;
        }
        const pool = await getShiftLogConnectionPool();
        const aliasResult = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('tagNameAlias', tagName)
            .query(`
        SELECT
          tagName
        FROM
          ShiftLog.TagAliases
        WHERE
          instance = @instance
          AND tagNameAlias = @tagNameAlias
          AND recordDelete_dateTime IS NULL
      `);
        const tagNameToAdd = aliasResult.recordset.length > 0 ? aliasResult.recordset[0].tagName : tagName;
        await pool
            .request()
            .input('workOrderId', workOrderId)
            .input('tagName', tagNameToAdd)
            .query(`
        INSERT INTO
          ShiftLog.WorkOrderTags (workOrderId, tagName)
        VALUES
          (@workOrderId, @tagName)
      `);
        return true;
    }
    catch {
        return false;
    }
}
