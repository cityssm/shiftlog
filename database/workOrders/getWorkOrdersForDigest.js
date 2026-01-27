import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
const newItemHours = 48;
export async function getWorkOrdersForDigest(assignedToId) {
    const pool = await getShiftLogConnectionPool();
    // Fetch open work orders assigned to the selected value
    const workOrdersResult = await pool
        .request()
        .input('assignedToId', assignedToId)
        .input('instance', getConfigProperty('application.instance'))
        .input('newItemHours', newItemHours)
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
        CASE
          WHEN w.workOrderDueDateTime IS NOT NULL
          AND w.workOrderDueDateTime < getdate() THEN 1
          ELSE 0
        END AS isOverdue,
        CASE
          WHEN datediff(hour, w.workOrderOpenDateTime, getdate()) <= @newItemHours THEN 1
          ELSE 0
        END AS isNew
      FROM
        ShiftLog.WorkOrders w
        LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
        LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId
        LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId
      WHERE
        w.instance = @instance
        AND w.recordDelete_dateTime IS NULL
        AND w.workOrderCloseDateTime IS NULL
        AND w.assignedToId = @assignedToId
      ORDER BY
        CASE
          WHEN w.workOrderDueDateTime IS NOT NULL
          AND w.workOrderDueDateTime < getdate() THEN 0
          ELSE 1
        END,
        w.workOrderDueDateTime,
        w.workOrderOpenDateTime DESC
    `);
    // Fetch open milestones assigned to the selected value
    const milestonesResult = await pool
        .request()
        .input('assignedToId', assignedToId)
        .input('instance', getConfigProperty('application.instance'))
        .input('newItemHours', newItemHours)
        .query(/* sql */ `
      SELECT
        m.workOrderMilestoneId,
        m.workOrderId,
        m.milestoneTitle,
        m.milestoneDescription,
        m.milestoneDueDateTime,
        m.milestoneCompleteDateTime,
        m.assignedToId,
        assignedTo.assignedToName,
        m.orderNumber,
        w.workOrderNumber,
        CASE
          WHEN m.milestoneDueDateTime IS NOT NULL
          AND m.milestoneDueDateTime < getdate() THEN 1
          ELSE 0
        END AS isOverdue,
        CASE
          WHEN datediff(hour, m.recordCreate_dateTime, getdate()) <= @newItemHours THEN 1
          ELSE 0
        END AS isNew
      FROM
        ShiftLog.WorkOrderMilestones m
        INNER JOIN ShiftLog.WorkOrders w ON m.workOrderId = w.workOrderId
        LEFT JOIN ShiftLog.AssignedTo assignedTo ON m.assignedToId = assignedTo.assignedToId
      WHERE
        w.instance = @instance
        AND w.recordDelete_dateTime IS NULL
        AND m.recordDelete_dateTime IS NULL
        AND w.workOrderCloseDateTime IS NULL
        AND m.milestoneCompleteDateTime IS NULL
        AND m.assignedToId = @assignedToId
      ORDER BY
        CASE
          WHEN m.milestoneDueDateTime IS NOT NULL
          AND m.milestoneDueDateTime < getdate() THEN 0
          ELSE 1
        END,
        m.milestoneDueDateTime,
        m.recordCreate_dateTime DESC
    `);
    return {
        workOrders: workOrdersResult.recordset,
        milestones: milestonesResult.recordset
    };
}
