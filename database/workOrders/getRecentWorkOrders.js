import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getRecentWorkOrders(limit, user) {
    const pool = await getShiftLogConnectionPool();
    let whereClause = 'where w.instance = @instance and w.recordDelete_dateTime is null';
    if (user !== undefined) {
        whereClause += `
      AND (
        wType.userGroupId IS NULL
        OR wType.userGroupId IN (
          SELECT
            userGroupId
          FROM
            ShiftLog.UserGroupMembers
          WHERE
            userName = @userName
        )
      )
    `;
    }
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', user?.userName)
        .input('limit', limit)
        .query(`
      SELECT
        TOP (@limit) w.workOrderId,
        w.workOrderNumber,
        wType.workOrderType,
        wStatus.dataListItem AS workOrderStatusDataListItem,
        w.workOrderTitle,
        w.workOrderOpenDateTime,
        w.workOrderDueDateTime,
        w.workOrderCloseDateTime,
        w.requestorName,
        w.locationAddress1,
        w.locationAddress2,
        assignedTo.assignedToName,
        cast(
          CASE
            WHEN w.recordCreate_dateTime = w.recordUpdate_dateTime THEN 0
            ELSE 1
          END AS BIT
        ) AS isUpdated
      FROM
        ShiftLog.WorkOrders w
        LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
        LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId
        LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId ${whereClause}
      ORDER BY
        w.recordUpdate_dateTime DESC
    `);
    return result.recordset;
}
