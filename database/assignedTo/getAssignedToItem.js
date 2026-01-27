import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getAssignedToItem(assignedToId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('assignedToId', assignedToId)
        .query(/* sql */ `
      SELECT
        a.assignedToId,
        a.assignedToName,
        a.orderNumber,
        a.userGroupId,
        ug.userGroupName,
        a.recordCreate_userName,
        a.recordCreate_dateTime,
        a.recordUpdate_userName,
        a.recordUpdate_dateTime
      FROM
        ShiftLog.AssignedTo a
        LEFT JOIN ShiftLog.UserGroups ug ON a.userGroupId = ug.userGroupId
      WHERE
        a.instance = @instance
        AND a.assignedToId = @assignedToId
        AND a.recordDelete_dateTime IS NULL
    `);
    return result.recordset[0];
}
