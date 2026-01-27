import type { ReportDefinition } from './types.js'

export const workOrderReports: Record<string, ReportDefinition> = {
  'workOrders-open': {
    parameterNames: [],
    sql: /* sql */ `
      SELECT
        w.workOrderId,
        w.workOrderNumber,
        wType.workOrderType,
        wStatus.dataListItem AS workOrderStatus,
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
        assignedTo.assignedToName AS assignedTo,
        milestones.milestonesCount,
        milestones.milestonesCompletedCount
      FROM
        ShiftLog.WorkOrders w
        LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
        LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId
        LEFT JOIN ShiftLog.AssignedTo assignedTo ON w.assignedToId = assignedTo.assignedToId
        LEFT JOIN (
          SELECT
            workOrderId,
            count(*) AS milestonesCount,
            sum(
              CASE
                WHEN milestoneCompleteDateTime IS NULL THEN 0
                ELSE 1
              END
            ) AS milestonesCompletedCount
          FROM
            ShiftLog.WorkOrderMilestones
          WHERE
            recordDelete_dateTime IS NULL
          GROUP BY
            workOrderId
        ) AS milestones ON milestones.workOrderId = w.workOrderId
      WHERE
        w.recordDelete_dateTime IS NULL
        AND w.workOrderCloseDateTime IS NULL
        AND w.instance = @instance
        AND (
          wType.userGroupId IN (
            SELECT
              userGroupId
            FROM
              ShiftLog.UserGroupMembers
            WHERE
              userName = @userName
          )
          OR wType.userGroupId IS NULL
        )
    `
  },

  'workOrders-workOrderCosts-byWorkOrderId': {
    parameterNames: ['workOrderId'],
    sql: /* sql */ `
      SELECT
        w.workOrderNumber,
        c.workOrderCostId,
        c.costDescription,
        c.costAmount,
        c.recordCreate_userName,
        c.recordCreate_dateTime,
        c.recordUpdate_userName,
        c.recordUpdate_dateTime
      FROM
        ShiftLog.WorkOrderCosts c
        LEFT JOIN ShiftLog.WorkOrders w ON c.workOrderId = w.workOrderId
      WHERE
        w.instance = @instance
        AND c.recordDelete_dateTime IS NULL
        AND c.workOrderId = @workOrderId
      ORDER BY
        c.workOrderCostId ASC
    `
  },

  'workOrders-workOrderNotes-byWorkOrderId': {
    parameterNames: ['workOrderId'],
    sql: /* sql */ `
      SELECT
        w.workOrderNumber,
        n.noteSequence,
        n.noteText,
        n.recordCreate_userName,
        n.recordCreate_dateTime,
        n.recordUpdate_userName,
        n.recordUpdate_dateTime
      FROM
        ShiftLog.WorkOrderNotes n
        LEFT JOIN ShiftLog.WorkOrders w ON n.workOrderId = w.workOrderId
      WHERE
        w.instance = @instance
        AND n.recordDelete_dateTime IS NULL
        AND n.workOrderId = @workOrderId
      ORDER BY
        n.noteSequence ASC
    `
  },

  'workOrders-workOrderTags-unmanaged': {
    parameterNames: [],
    sql: /* sql */ `
      SELECT
        wo.workOrderNumber,
        wot.tagName
      FROM
        ShiftLog.WorkOrderTags wot
        LEFT JOIN ShiftLog.WorkOrders wo ON wot.workOrderId = wo.workOrderId
        LEFT JOIN ShiftLog.WorkOrderTypes woType ON wo.workOrderTypeId = woType.workOrderTypeId
        LEFT JOIN ShiftLog.Tags t ON wot.tagName = t.tagName
        AND wo.instance = t.instance
        AND t.recordDelete_dateTime IS NULL
      WHERE
        wo.recordDelete_dateTime IS NULL
        AND t.tagName IS NULL
        AND wo.instance = @instance
        AND (
          woType.userGroupId IN (
            SELECT
              userGroupId
            FROM
              ShiftLog.UserGroupMembers
            WHERE
              userName = @userName
          )
          OR woType.userGroupId IS NULL
        )
    `
  }
}

export default workOrderReports
