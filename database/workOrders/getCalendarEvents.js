import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
/**
 * Retrieves calendar events for work orders and milestones within a specified month.
 * @param filters - Filter parameters including year, month, date type toggles, and assigned to filter
 * @param user - Optional user object for applying user group security filtering.
 *               When provided, only work orders from work order types accessible to the user's groups are returned.
 * @returns Array of calendar events matching the specified filters
 */
export default async function getCalendarEvents(filters, user) {
    const pool = await getShiftLogConnectionPool();
    const instance = getConfigProperty('application.instance');
    // Calculate date range for the month
    const startDate = new Date(filters.year, filters.month - 1, 1);
    const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
    const events = [];
    // Build user group WHERE clause for security
    const userGroupWhereClause = user === undefined
        ? ''
        : `and (wType.userGroupId is null or wType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        ))`;
    // Query for work order dates
    if (filters.showOpenDates || filters.showDueDates || filters.showCloseDates) {
        const workOrderDateQueries = [];
        if (filters.showOpenDates) {
            workOrderDateQueries.push(/* sql */ `
        select
          w.workOrderOpenDateTime as eventDate,
          'workOrderOpen' as eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          w.assignedToDataListItemId,
          dt.dataListItem as assignedToDataListItem,
          null as milestoneId,
          null as milestoneTitle,
          w.workOrderCloseDateTime,
          null as milestoneCompleteDateTime
        from ShiftLog.WorkOrders w
        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId
        left join ShiftLog.DataListItems dt on w.assignedToDataListItemId = dt.dataListItemId
        where w.instance = @instance
          and w.recordDelete_dateTime is null
          and w.workOrderOpenDateTime between @startDate and @endDate
          ${filters.assignedToDataListItemId === undefined ? '' : 'and w.assignedToDataListItemId = @assignedToDataListItemId'}
          ${userGroupWhereClause}
      `);
        }
        if (filters.showDueDates) {
            workOrderDateQueries.push(/* sql */ `
        select
          w.workOrderDueDateTime as eventDate,
          'workOrderDue' as eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          w.assignedToDataListItemId,
          dt.dataListItem as assignedToDataListItem,
          null as milestoneId,
          null as milestoneTitle,
          w.workOrderCloseDateTime,
          null as milestoneCompleteDateTime
        from ShiftLog.WorkOrders w
        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId
        left join ShiftLog.DataListItems dt on w.assignedToDataListItemId = dt.dataListItemId
        where w.instance = @instance
          and w.recordDelete_dateTime is null
          and w.workOrderDueDateTime is not null
          and w.workOrderDueDateTime between @startDate and @endDate
          ${filters.assignedToDataListItemId === undefined ? '' : 'and w.assignedToDataListItemId = @assignedToDataListItemId'}
          ${userGroupWhereClause}
      `);
        }
        if (filters.showCloseDates) {
            workOrderDateQueries.push(/* sql */ `
        select
          w.workOrderCloseDateTime as eventDate,
          'workOrderClose' as eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          w.assignedToDataListItemId,
          dt.dataListItem as assignedToDataListItem,
          null as milestoneId,
          null as milestoneTitle,
          w.workOrderCloseDateTime,
          null as milestoneCompleteDateTime
        from ShiftLog.WorkOrders w
        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId
        left join ShiftLog.DataListItems dt on w.assignedToDataListItemId = dt.dataListItemId
        where w.instance = @instance
          and w.recordDelete_dateTime is null
          and w.workOrderCloseDateTime is not null
          and w.workOrderCloseDateTime between @startDate and @endDate
          ${filters.assignedToDataListItemId === undefined ? '' : 'and w.assignedToDataListItemId = @assignedToDataListItemId'}
          ${userGroupWhereClause}
      `);
        }
        if (workOrderDateQueries.length > 0) {
            const workOrderQuery = workOrderDateQueries.join(' union all ');
            const request = pool.request();
            request.input('instance', instance);
            request.input('startDate', startDate);
            request.input('endDate', endDate);
            if (filters.assignedToDataListItemId !== undefined) {
                request.input('assignedToDataListItemId', filters.assignedToDataListItemId);
            }
            if (user !== undefined) {
                request.input('userName', user.userName);
            }
            const workOrderResults = await request.query(workOrderQuery);
            events.push(...workOrderResults.recordset);
        }
    }
    // Query for milestone dates
    if (filters.showMilestoneDueDates || filters.showMilestoneCompleteDates) {
        const milestoneQueries = [];
        if (filters.showMilestoneDueDates) {
            milestoneQueries.push(/* sql */ `
        select
          m.milestoneDueDateTime as eventDate,
          'milestoneDue' as eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          coalesce(m.assignedToDataListItemId, w.assignedToDataListItemId) as assignedToDataListItemId,
          coalesce(mdt.dataListItem, wdt.dataListItem) as assignedToDataListItem,
          m.workOrderMilestoneId as milestoneId,
          m.milestoneTitle,
          w.workOrderCloseDateTime,
          m.milestoneCompleteDateTime
        from ShiftLog.WorkOrderMilestones m
        inner join ShiftLog.WorkOrders w on m.workOrderId = w.workOrderId
        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId
        left join ShiftLog.DataListItems mdt on m.assignedToDataListItemId = mdt.dataListItemId
        left join ShiftLog.DataListItems wdt on w.assignedToDataListItemId = wdt.dataListItemId
        where w.instance = @instance
          and w.recordDelete_dateTime is null
          and m.recordDelete_dateTime is null
          and m.milestoneDueDateTime is not null
          and m.milestoneDueDateTime between @startDate and @endDate
          ${filters.assignedToDataListItemId === undefined
                ? ''
                : `and (m.assignedToDataListItemId = @assignedToDataListItemId
                   or (m.assignedToDataListItemId is null and w.assignedToDataListItemId = @assignedToDataListItemId))`}
          ${userGroupWhereClause}
      `);
        }
        if (filters.showMilestoneCompleteDates) {
            milestoneQueries.push(/* sql */ `
        select
          m.milestoneCompleteDateTime as eventDate,
          'milestoneComplete' as eventType,
          w.workOrderId,
          w.workOrderNumber,
          w.workOrderDetails,
          coalesce(m.assignedToDataListItemId, w.assignedToDataListItemId) as assignedToDataListItemId,
          coalesce(mdt.dataListItem, wdt.dataListItem) as assignedToDataListItem,
          m.workOrderMilestoneId as milestoneId,
          m.milestoneTitle,
          w.workOrderCloseDateTime,
          m.milestoneCompleteDateTime
        from ShiftLog.WorkOrderMilestones m
        inner join ShiftLog.WorkOrders w on m.workOrderId = w.workOrderId
        inner join ShiftLog.WorkOrderTypes wType on w.workOrderTypeId = wType.workOrderTypeId
        left join ShiftLog.DataListItems mdt on m.assignedToDataListItemId = mdt.dataListItemId
        left join ShiftLog.DataListItems wdt on w.assignedToDataListItemId = wdt.dataListItemId
        where w.instance = @instance
          and w.recordDelete_dateTime is null
          and m.recordDelete_dateTime is null
          and m.milestoneCompleteDateTime is not null
          and m.milestoneCompleteDateTime between @startDate and @endDate
          ${filters.assignedToDataListItemId === undefined
                ? ''
                : `and (m.assignedToDataListItemId = @assignedToDataListItemId
                   or (m.assignedToDataListItemId is null and w.assignedToDataListItemId = @assignedToDataListItemId))`}
          ${userGroupWhereClause}
      `);
        }
        if (milestoneQueries.length > 0) {
            const milestoneQuery = milestoneQueries.join(' union all ');
            const request = pool.request();
            request.input('instance', instance);
            request.input('startDate', startDate);
            request.input('endDate', endDate);
            if (filters.assignedToDataListItemId !== undefined) {
                request.input('assignedToDataListItemId', filters.assignedToDataListItemId);
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
