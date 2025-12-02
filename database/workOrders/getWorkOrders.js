// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
function buildWhereClause(filters, user) {
    let whereClause = 'where w.instance = @instance and w.recordDelete_dateTime is null';
    if (filters.workOrderNumber !== undefined && filters.workOrderNumber !== '') {
        whereClause += ' and w.workOrderNumber like @workOrderNumber';
    }
    if (filters.workOrderTypeId !== undefined && filters.workOrderTypeId !== '') {
        whereClause += ' and w.workOrderTypeId = @workOrderTypeId';
    }
    if (filters.workOrderStatusDataListItemId !== undefined &&
        filters.workOrderStatusDataListItemId !== '') {
        whereClause +=
            ' and w.workOrderStatusDataListItemId = @workOrderStatusDataListItemId';
    }
    if (filters.requestorName !== undefined && filters.requestorName !== '') {
        whereClause += ' and w.requestorName like @requestorName';
    }
    if (filters.requestor !== undefined && filters.requestor !== '') {
        whereClause +=
            ' and (w.requestorName like @requestor or w.requestorContactInfo like @requestor)';
    }
    if (filters.assignedToDataListItemId !== undefined &&
        filters.assignedToDataListItemId !== '') {
        whereClause += ` and (w.assignedToDataListItemId = @assignedToDataListItemId
      or w.workOrderId in (
        select workOrderId from ShiftLog.WorkOrderMilestones
        where assignedToDataListItemId = @assignedToDataListItemId
          and recordDelete_dateTime is null
      )
    )`;
    }
    if (filters.openClosedFilter !== undefined &&
        filters.openClosedFilter !== '') {
        switch (filters.openClosedFilter) {
            case 'closed': {
                whereClause += ' and w.workOrderCloseDateTime is not null';
                break;
            }
            case 'open': {
                whereClause += ' and w.workOrderCloseDateTime is null';
                break;
            }
            case 'overdue': {
                whereClause += ` and w.workOrderCloseDateTime is null
              and (
                w.workOrderDueDateTime < getdate()
                or w.workOrderId in (
                  select workOrderId from ShiftLog.WorkOrderMilestones
                  where milestoneCompleteDateTime is null
                    and milestoneDueDateTime < getdate()
                )
              )
          `;
                break;
            }
        }
    }
    if (filters.searchString !== undefined && filters.searchString !== '') {
        whereClause += ` and (
      w.workOrderNumber like @searchString
      or w.requestorName like @searchString
      or w.requestorContactInfo like @searchString
      or w.workOrderDetails like @searchString
    )`;
    }
    if (user !== undefined) {
        whereClause += `
      and (
        wType.userGroupId is null or wType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        )
      )
    `;
    }
    return whereClause;
}
function applyParameters(sqlRequest, filters, user) {
    sqlRequest
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderNumber', filters.workOrderNumber === undefined
        ? null
        : `%${filters.workOrderNumber}%`)
        .input('workOrderTypeId', filters.workOrderTypeId ?? null)
        .input('workOrderStatusDataListItemId', filters.workOrderStatusDataListItemId ?? null)
        .input('requestorName', filters.requestorName === undefined ? null : `%${filters.requestorName}%`)
        .input('requestor', filters.requestor === undefined ? null : `%${filters.requestor}%`)
        .input('assignedToDataListItemId', filters.assignedToDataListItemId ?? null)
        .input('searchString', filters.searchString === undefined ? null : `%${filters.searchString}%`)
        .input('userName', user?.userName);
}
export default async function getWorkOrders(filters, options, user) {
    const pool = await getShiftLogConnectionPool();
    const whereClause = buildWhereClause(filters, user);
    const limit = typeof options.limit === 'string'
        ? Number.parseInt(options.limit, 10)
        : options.limit;
    const offset = typeof options.offset === 'string'
        ? Number.parseInt(options.offset, 10)
        : options.offset;
    // Get total count if limit === -1
    let totalCount = 0;
    if (limit !== -1) {
        const countSql = /* sql */ `
      select count(*) as totalCount
      from ShiftLog.WorkOrders w
      left join ShiftLog.WorkOrderTypes wType
        on w.workOrderTypeId = wType.workOrderTypeId
      ${whereClause}
    `;
        const countRequest = pool.request();
        applyParameters(countRequest, filters, user);
        const countResult = await countRequest.query(countSql);
        totalCount = countResult.recordset[0].totalCount;
    }
    // Main query with limit and offset
    let workOrders = [];
    if (totalCount > 0 || limit === -1) {
        const workOrdersRequest = pool.request();
        applyParameters(workOrdersRequest, filters, user);
        const workOrdersResult = await workOrdersRequest.query(/* sql */ `
        select
          w.workOrderId,

          w.workOrderNumberPrefix,
          w.workOrderNumberYear,
          w.workOrderNumberSequence,
          w.workOrderNumberOverride,
          w.workOrderNumber,

          w.workOrderTypeId,
          wType.workOrderType,

          w.workOrderStatusDataListItemId,
          wStatus.dataListItem as workOrderStatusDataListItem,

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

          w.assignedToDataListItemId,
          assignedTo.dataListItem as assignedToDataListItem,

          ${options.includeMoreInfoFormData === true
            ? 'w.moreInfoFormDataJson,'
            : ''}

          milestones.milestonesCount,
          milestones.milestonesCompletedCount
          
        from ShiftLog.WorkOrders w

        left join ShiftLog.WorkOrderTypes wType
          on w.workOrderTypeId = wType.workOrderTypeId

        left join ShiftLog.DataListItems wStatus
          on w.workOrderStatusDataListItemId = wStatus.dataListItemId

        left join ShiftLog.DataListItems assignedTo
          on w.assignedToDataListItemId = assignedTo.dataListItemId

        left join (
          select workOrderId,
            count(*) as milestonesCount,
            sum(
              case when milestoneCompleteDateTime is null then 0 else 1 end
            ) as milestonesCompletedCount
          from ShiftLog.WorkOrderMilestones
          where recordDelete_dateTime is null
          group by workOrderId
        ) as milestones on milestones.workOrderId = w.workOrderId

        ${whereClause}    

        order by w.workOrderOpenDateTime desc, w.workOrderNumberYear desc, w.workOrderNumberSequence desc

        ${limit === -1 ? '' : ` offset ${offset} rows`}
        ${limit === -1 ? '' : ` fetch next ${limit} rows only`}
      `);
        workOrders = workOrdersResult.recordset;
        if (limit === -1) {
            totalCount = workOrders.length;
        }
        if (options.includeMoreInfoFormData === true) {
            for (const workOrder of workOrders) {
                if (workOrder.moreInfoFormDataJson === undefined) {
                    workOrder.moreInfoFormData = {};
                }
                else {
                    try {
                        workOrder.moreInfoFormData = JSON.parse(workOrder.moreInfoFormDataJson);
                    }
                    catch {
                        workOrder.moreInfoFormData = {};
                    }
                }
            }
        }
    }
    return {
        workOrders,
        totalCount
    };
}
