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
    if (filters.assignedToId !== undefined && filters.assignedToId !== '') {
        whereClause += /* sql */ `
      AND (
        w.assignedToId = @assignedToId
        OR w.workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrderMilestones
          WHERE
            assignedToId = @assignedToId
            AND recordDelete_dateTime IS NULL
        )
      )
    `;
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
                whereClause += /* sql */ `
          AND w.workOrderCloseDateTime IS NULL
          AND (
            w.workOrderDueDateTime < getdate()
            OR w.workOrderId IN (
              SELECT
                workOrderId
              FROM
                ShiftLog.WorkOrderMilestones
              WHERE
                milestoneCompleteDateTime IS NULL
                AND milestoneDueDateTime < getdate()
            )
          )
        `;
                break;
            }
        }
    }
    if (filters.searchString !== undefined && filters.searchString !== '') {
        whereClause += /* sql */ `
      AND (
        w.workOrderNumber LIKE @searchString
        OR w.requestorName LIKE @searchString
        OR w.requestorContactInfo LIKE @searchString
        OR w.workOrderDetails LIKE @searchString
      )
    `;
    }
    if (filters.tagName !== undefined && filters.tagName !== '') {
        whereClause += /* sql */ `
      AND w.workOrderId IN (
        SELECT
          workOrderId
        FROM
          ShiftLog.WorkOrderTags
        WHERE
          tagName = @tagName
      )
    `;
    }
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
        .input('assignedToId', filters.assignedToId ?? null)
        .input('searchString', filters.searchString === undefined ? null : `%${filters.searchString}%`)
        .input('tagName', filters.tagName ?? null)
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
      SELECT
        count(*) AS totalCount
      FROM
        ShiftLog.WorkOrders w
        LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId ${whereClause}
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
        const workOrdersResult = await workOrdersRequest.query(
        /* sql */ `
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
          w.workOrderPriorityDataListItemId,
          wPriority.dataListItem AS workOrderPriorityDataListItem,
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
          ${options.includeMoreInfoFormData === true
            ? 'w.moreInfoFormDataJson,'
            : ''} milestones.milestonesCount,
          milestones.milestonesCompletedCount,
          attachments.attachmentsCount,
          thumbnails.thumbnailAttachmentId,
          notes.notesCount,
          costs.costsCount,
          costs.costsTotal
        FROM
          ShiftLog.WorkOrders w
          LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
          LEFT JOIN ShiftLog.DataListItems wStatus ON w.workOrderStatusDataListItemId = wStatus.dataListItemId
          LEFT JOIN ShiftLog.DataListItems wPriority ON w.workOrderPriorityDataListItemId = wPriority.dataListItemId
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
          LEFT JOIN (
            SELECT
              workOrderId,
              count(*) AS attachmentsCount
            FROM
              ShiftLog.WorkOrderAttachments
            WHERE
              recordDelete_dateTime IS NULL
            GROUP BY
              workOrderId
          ) AS attachments ON attachments.workOrderId = w.workOrderId
          LEFT JOIN (
            SELECT
              workOrderId,
              workOrderAttachmentId AS thumbnailAttachmentId
            FROM
              ShiftLog.WorkOrderAttachments
            WHERE
              recordDelete_dateTime IS NULL
              AND isWorkOrderThumbnail = 1
          ) AS thumbnails ON thumbnails.workOrderId = w.workOrderId
          LEFT JOIN (
            SELECT
              workOrderId,
              count(*) AS notesCount
            FROM
              ShiftLog.WorkOrderNotes
            WHERE
              recordDelete_dateTime IS NULL
            GROUP BY
              workOrderId
          ) AS notes ON notes.workOrderId = w.workOrderId
          LEFT JOIN (
            SELECT
              workOrderId,
              count(*) AS costsCount,
              sum(costAmount) AS costsTotal
            FROM
              ShiftLog.WorkOrderCosts
            WHERE
              recordDelete_dateTime IS NULL
            GROUP BY
              workOrderId
          ) AS costs ON costs.workOrderId = w.workOrderId ${whereClause}
        ORDER BY
          w.workOrderOpenDateTime DESC,
          w.workOrderNumberYear DESC,
          w.workOrderNumberSequence DESC ${limit === -1
            ? ''
            : ` offset ${offset} rows`} ${limit === -1
            ? ''
            : ` fetch next ${limit} rows only`}
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
        // Fetch tags for all work orders
        if (workOrders.length > 0) {
            const workOrderIds = workOrders.map((wo) => wo.workOrderId);
            const tagsRequest = pool.request();
            tagsRequest.input('instance', getConfigProperty('application.instance'));
            // Build parameterized IN clause
            const parameterNames = workOrderIds.map((_, index) => `@workOrderId${index}`);
            for (const [index, id] of workOrderIds.entries()) {
                tagsRequest.input(`workOrderId${index}`, id);
            }
            const tagsResult = await tagsRequest.query(/* sql */ `
        SELECT
          wot.workOrderId,
          wot.tagName,
          t.tagBackgroundColor,
          t.tagTextColor
        FROM
          ShiftLog.WorkOrderTags wot
          LEFT JOIN ShiftLog.Tags t ON wot.tagName = t.tagName
          AND t.instance = @instance
          AND t.recordDelete_dateTime IS NULL
        WHERE
          wot.workOrderId IN (${parameterNames.join(',')})
        ORDER BY
          wot.workOrderId,
          wot.tagName
      `);
            // Group tags by workOrderId
            const tagsByWorkOrder = new Map();
            for (const tag of tagsResult.recordset) {
                if (!tagsByWorkOrder.has(tag.workOrderId)) {
                    tagsByWorkOrder.set(tag.workOrderId, []);
                }
                tagsByWorkOrder.get(tag.workOrderId)?.push(tag);
            }
            // Assign tags to work orders
            for (const workOrder of workOrders) {
                workOrder.tags = tagsByWorkOrder.get(workOrder.workOrderId) ?? [];
            }
        }
    }
    return {
        workOrders,
        totalCount
    };
}
