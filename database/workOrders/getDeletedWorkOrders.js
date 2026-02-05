import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getDeletedWorkOrders(user) {
    const pool = await getShiftLogConnectionPool();
    let whereClause = 'where w.instance = @instance and w.recordDelete_dateTime is not null';
    if (user !== undefined) {
        whereClause += /* sql */ `
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
    const workOrdersResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', user?.userName)
        .query(/* sql */ `
      SELECT
        w.workOrderId,
        w.workOrderNumberPrefix,
        w.workOrderNumberYear,
        w.workOrderNumberSequence,
        w.workOrderNumberOverride,
        w.workOrderNumber,
        w.workOrderTypeId,
        wType.workOrderType,
        w.workOrderStatusDataListItemId,
        wStatus.dataListItem AS workOrderStatusDataListItem,
        w.workOrderDetails,
        w.workOrderOpenDateTime,
        w.workOrderDueDateTime,
        w.workOrderCloseDateTime,
        w.requestorName,
        w.requestorContactInfo,
        w.locationLatitude,
        w.locationLongitude,
        w.locationAddress1,
        w.locationAddress2,
        w.locationCityProvince,
        w.assignedToId,
        assignedTo.assignedToName,
        w.recordDelete_userName,
        w.recordDelete_dateTime
      FROM
        ShiftLog.WorkOrders w
        LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
        LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId
        LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId ${whereClause}
      ORDER BY
        w.recordDelete_dateTime DESC
    `);
    const workOrders = workOrdersResult.recordset;
    return workOrders;
}
