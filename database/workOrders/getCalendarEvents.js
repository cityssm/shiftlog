import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getCalendarEvents(filters, user) {
    const pool = await getShiftLogConnectionPool();
    const instance = getConfigProperty('application.instance');
    const startDate = new Date(filters.year, filters.month - 1, 1);
    const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
    const events = [];
    const userGroupWhereClause = user === undefined
        ? ''
        : `
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
    if (filters.showOpenDates || filters.showDueDates || filters.showCloseDates) {
        const workOrderDateQueries = [];
        if (filters.showOpenDates) {
            workOrderDateQueries.push(`
        SELECT
          w.workOrderOpenDateTime AS eventDate,
          'workOrderOpen' AS eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          w.assignedToId,
          a.assignedToName,
          NULL AS milestoneId,
          NULL AS milestoneTitle,
          w.workOrderCloseDateTime,
          w.workOrderDueDateTime,
          NULL AS milestoneCompleteDateTime,
          NULL AS milestoneDueDateTime
        FROM
          ShiftLog.WorkOrders w
          INNER JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
          LEFT JOIN ShiftLog.AssignedTo a ON w.assignedToId = a.assignedToId
        WHERE
          w.instance = @instance
          AND w.recordDelete_dateTime IS NULL
          AND w.workOrderOpenDateTime BETWEEN @startDate AND @endDate  ${filters.assignedToId ===
                undefined
                ? ''
                : 'and w.assignedToId = @assignedToId'} ${userGroupWhereClause}
      `);
        }
        if (filters.showDueDates) {
            workOrderDateQueries.push(`
        SELECT
          w.workOrderDueDateTime AS eventDate,
          'workOrderDue' AS eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          w.assignedToId,
          a.assignedToName,
          NULL AS milestoneId,
          NULL AS milestoneTitle,
          w.workOrderCloseDateTime,
          w.workOrderDueDateTime,
          NULL AS milestoneCompleteDateTime,
          NULL AS milestoneDueDateTime
        FROM
          ShiftLog.WorkOrders w
          INNER JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
          LEFT JOIN ShiftLog.AssignedTo a ON w.assignedToId = a.assignedToId
        WHERE
          w.instance = @instance
          AND w.recordDelete_dateTime IS NULL
          AND w.workOrderDueDateTime IS NOT NULL
          AND w.workOrderDueDateTime BETWEEN @startDate AND @endDate  ${filters.assignedToId ===
                undefined
                ? ''
                : 'and w.assignedToId = @assignedToId'} ${userGroupWhereClause}
      `);
        }
        if (filters.showCloseDates) {
            workOrderDateQueries.push(`
        SELECT
          w.workOrderCloseDateTime AS eventDate,
          'workOrderClose' AS eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          w.assignedToId,
          a.assignedToName,
          NULL AS milestoneId,
          NULL AS milestoneTitle,
          w.workOrderCloseDateTime,
          w.workOrderDueDateTime,
          NULL AS milestoneCompleteDateTime,
          NULL AS milestoneDueDateTime
        FROM
          ShiftLog.WorkOrders w
          INNER JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
          LEFT JOIN ShiftLog.AssignedTo a ON w.assignedToId = a.assignedToId
        WHERE
          w.instance = @instance
          AND w.recordDelete_dateTime IS NULL
          AND w.workOrderCloseDateTime IS NOT NULL
          AND w.workOrderCloseDateTime BETWEEN @startDate AND @endDate  ${filters.assignedToId ===
                undefined
                ? ''
                : 'and w.assignedToId = @assignedToId'} ${userGroupWhereClause}
      `);
        }
        if (workOrderDateQueries.length > 0) {
            const workOrderQuery = workOrderDateQueries.join(' union all ');
            const request = pool.request();
            request.input('instance', instance);
            request.input('startDate', startDate);
            request.input('endDate', endDate);
            if (filters.assignedToId !== undefined) {
                request.input('assignedToId', filters.assignedToId);
            }
            if (user !== undefined) {
                request.input('userName', user.userName);
            }
            const workOrderResults = await request.query(workOrderQuery);
            events.push(...workOrderResults.recordset);
        }
    }
    if (filters.showMilestoneDueDates || filters.showMilestoneCompleteDates) {
        const milestoneQueries = [];
        if (filters.showMilestoneDueDates) {
            milestoneQueries.push(`
        SELECT
          m.milestoneDueDateTime AS eventDate,
          'milestoneDue' AS eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          coalesce(m.assignedToId, w.assignedToId) AS assignedToId,
          coalesce(ma.assignedToName, wa.assignedToName) AS assignedToName,
          m.workOrderMilestoneId AS milestoneId,
          m.milestoneTitle,
          w.workOrderCloseDateTime,
          w.workOrderDueDateTime,
          m.milestoneCompleteDateTime,
          m.milestoneDueDateTime
        FROM
          ShiftLog.WorkOrderMilestones m
          INNER JOIN ShiftLog.WorkOrders w ON m.workOrderId = w.workOrderId
          INNER JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
          LEFT JOIN ShiftLog.AssignedTo ma ON m.assignedToId = ma.assignedToId
          LEFT JOIN ShiftLog.AssignedTo wa ON w.assignedToId = wa.assignedToId
        WHERE
          w.instance = @instance
          AND w.recordDelete_dateTime IS NULL
          AND m.recordDelete_dateTime IS NULL
          AND m.milestoneDueDateTime IS NOT NULL
          AND m.milestoneDueDateTime BETWEEN @startDate AND @endDate  ${filters.assignedToId ===
                undefined
                ? ''
                : `
                AND (
                  m.assignedToId = @assignedToId
                  OR (
                    m.assignedToId IS NULL
                    AND w.assignedToId = @assignedToId
                  )
                )
              `} ${userGroupWhereClause}
      `);
        }
        if (filters.showMilestoneCompleteDates) {
            milestoneQueries.push(`
        SELECT
          m.milestoneCompleteDateTime AS eventDate,
          'milestoneComplete' AS eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          coalesce(m.assignedToId, w.assignedToId) AS assignedToId,
          coalesce(ma.assignedToName, wa.assignedToName) AS assignedToName,
          m.workOrderMilestoneId AS milestoneId,
          m.milestoneTitle,
          w.workOrderCloseDateTime,
          w.workOrderDueDateTime,
          m.milestoneCompleteDateTime,
          m.milestoneDueDateTime
        FROM
          ShiftLog.WorkOrderMilestones m
          INNER JOIN ShiftLog.WorkOrders w ON m.workOrderId = w.workOrderId
          INNER JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
          LEFT JOIN ShiftLog.AssignedTo ma ON m.assignedToId = ma.assignedToId
          LEFT JOIN ShiftLog.AssignedTo wa ON w.assignedToId = wa.assignedToId
        WHERE
          w.instance = @instance
          AND w.recordDelete_dateTime IS NULL
          AND m.recordDelete_dateTime IS NULL
          AND m.milestoneCompleteDateTime IS NOT NULL
          AND m.milestoneCompleteDateTime BETWEEN @startDate AND @endDate  ${filters.assignedToId ===
                undefined
                ? ''
                : `
                OR (
                  m.assignedToId IS NULL
                  AND w.assignedToId = @assignedToId
                )
              `} ${userGroupWhereClause}
      `);
        }
        if (milestoneQueries.length > 0) {
            const milestoneQuery = milestoneQueries.join(' union all ');
            const request = pool.request();
            request.input('instance', instance);
            request.input('startDate', startDate);
            request.input('endDate', endDate);
            if (filters.assignedToId !== undefined) {
                request.input('assignedToId', filters.assignedToId);
            }
            if (user !== undefined) {
                request.input('userName', user.userName);
            }
            const milestoneResults = await request.query(milestoneQuery);
            events.push(...milestoneResults.recordset);
        }
    }
    return events;
}
