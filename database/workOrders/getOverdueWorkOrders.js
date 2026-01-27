import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getOverdueWorkOrders(limit, user) {
    const pool = await getShiftLogConnectionPool();
    let whereClause = /* sql */ `
    WHERE
      w.recordDelete_dateTime IS NULL
      AND w.workOrderCloseDateTime IS NULL
      AND w.workOrderDueDateTime < getdate()
      AND w.instance = @instance
  `;
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
    const result = (await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('userName', user?.userName)
        .input('limit', limit)
        .query(/* sql */ `
      SELECT
        TOP (@limit) w.workOrderId,
        w.workOrderNumberYear,
        w.workOrderNumberSequence,
        isnull(wType.workOrderNumberPrefix, '') + cast(w.workOrderNumberYear AS VARCHAR(4)) + '-' + right(
          '000000' + cast(w.workOrderNumberSequence AS VARCHAR(6)),
          6
        ) AS workOrderNumber,
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
        assignedTo.assignedToName
      FROM
        ShiftLog.WorkOrders w
        LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
        LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId
        LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId ${whereClause}
      ORDER BY
        w.workOrderDueDateTime ASC,
        w.workOrderNumberYear DESC,
        w.workOrderNumberSequence DESC
    `));
    return result.recordset;
}
