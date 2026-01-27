import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

export interface GetWorkOrdersForPlannerFilters {
  assignedToId?: number | string
  includeUnassigned?: boolean

  workOrderTypeId?: number | string

  workOrderPriorityDataListItemId?: number | string
  workOrderStatusDataListItemId?: number | string

  dateFilter?:
    | ''
    | 'dueInDays'
    | 'milestonesDueInDays'
    | 'milestonesOverdue'
    | 'noUpdatesForDays'
    | 'openForDays'
    | 'overdue'
  daysThreshold?: number | string
}

export interface GetWorkOrdersForPlannerOptions {
  limit: number | string
  offset: number | string
}

function buildWhereClause(
  filters: GetWorkOrdersForPlannerFilters,
  user?: User
): string {
  let whereClause =
    'where w.instance = @instance and w.recordDelete_dateTime is null'

  // Only include open work orders
  whereClause += ' and w.workOrderCloseDateTime is null'

  if (filters.workOrderTypeId !== undefined && filters.workOrderTypeId !== '') {
    whereClause += ' and w.workOrderTypeId = @workOrderTypeId'
  }

  if (
    filters.workOrderPriorityDataListItemId !== undefined &&
    filters.workOrderPriorityDataListItemId !== ''
  ) {
    whereClause +=
      ' and w.workOrderPriorityDataListItemId = @workOrderPriorityDataListItemId'
  }

  if (
    filters.workOrderStatusDataListItemId !== undefined &&
    filters.workOrderStatusDataListItemId !== ''
  ) {
    whereClause +=
      ' and w.workOrderStatusDataListItemId = @workOrderStatusDataListItemId'
  }

  // Handle assigned/unassigned filter
  if (filters.includeUnassigned === true) {
    whereClause += /* sql */ `
      AND (
        w.assignedToId IS NULL
        OR EXISTS (
          SELECT
            1
          FROM
            ShiftLog.WorkOrderMilestones
          WHERE
            workOrderId = w.workOrderId
            AND assignedToId IS NULL
            AND recordDelete_dateTime IS NULL
        )
      )
    `
  } else if (
    filters.assignedToId !== undefined &&
    filters.assignedToId !== ''
  ) {
    whereClause += /* sql */ `
      AND (
        w.assignedToId = @assignedToId
        OR EXISTS (
          SELECT
            1
          FROM
            ShiftLog.WorkOrderMilestones
          WHERE
            workOrderId = w.workOrderId
            AND assignedToId = @assignedToId
            AND recordDelete_dateTime IS NULL
        )
      )
    `
  }

  // Handle date filters
  if (filters.dateFilter !== undefined && filters.dateFilter !== '') {
    switch (filters.dateFilter) {
      case 'dueInDays': {
        whereClause += /* sql */ `
          AND w.workOrderDueDateTime IS NOT NULL
          AND datediff(day, getdate(), w.workOrderDueDateTime) <= @daysThreshold
          AND w.workOrderDueDateTime >= getdate()
        `
        break
      }
      case 'milestonesDueInDays': {
        whereClause += /* sql */ `
          AND EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderMilestones
            WHERE
              workOrderId = w.workOrderId
              AND milestoneCompleteDateTime IS NULL
              AND milestoneDueDateTime IS NOT NULL
              AND datediff(day, getdate(), milestoneDueDateTime) <= @daysThreshold
              AND milestoneDueDateTime >= getdate()
              AND recordDelete_dateTime IS NULL
          )
        `
        break
      }
      case 'milestonesOverdue': {
        whereClause += /* sql */ `
          AND EXISTS (
            SELECT
              1
            FROM
              ShiftLog.WorkOrderMilestones
            WHERE
              workOrderId = w.workOrderId
              AND milestoneCompleteDateTime IS NULL
              AND milestoneDueDateTime < getdate()
              AND recordDelete_dateTime IS NULL
          )
        `
        break
      }
      case 'noUpdatesForDays': {
        whereClause += /* sql */ `
          AND (
            w.recordUpdate_dateTime IS NULL
            OR datediff(day, w.recordUpdate_dateTime, getdate()) >= @daysThreshold
          )
        `
        break
      }
      case 'openForDays': {
        whereClause +=
          ' and datediff(day, w.workOrderOpenDateTime, getdate()) >= @daysThreshold'
        break
      }
      case 'overdue': {
        whereClause += ' and w.workOrderDueDateTime < getdate()'
        break
      }
    }
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
    `
  }

  return whereClause
}

function applyParameters(
  sqlRequest: mssql.Request,
  filters: GetWorkOrdersForPlannerFilters,
  user?: User
): void {
  sqlRequest
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderTypeId', filters.workOrderTypeId ?? null)
    .input(
      'workOrderPriorityDataListItemId',
      filters.workOrderPriorityDataListItemId ?? null
    )
    .input(
      'workOrderStatusDataListItemId',
      filters.workOrderStatusDataListItemId ?? null
    )
    .input('assignedToId', filters.assignedToId ?? null)
    .input(
      'daysThreshold',
      filters.daysThreshold === undefined
        ? null
        : typeof filters.daysThreshold === 'string'
          ? Number.parseInt(filters.daysThreshold, 10)
          : filters.daysThreshold
    )
    .input('userName', user?.userName)
}

export default async function getWorkOrdersForPlanner(
  filters: GetWorkOrdersForPlannerFilters,
  options: GetWorkOrdersForPlannerOptions,
  user?: User
): Promise<{
  workOrders: WorkOrder[]
  totalCount: number
}> {
  const pool = await getShiftLogConnectionPool()

  const whereClause = buildWhereClause(filters, user)

  const limit =
    typeof options.limit === 'string'
      ? Number.parseInt(options.limit, 10)
      : options.limit

  const offset =
    typeof options.offset === 'string'
      ? Number.parseInt(options.offset, 10)
      : options.offset

  // Get total count if limit !== -1

  let totalCount = 0

  if (limit !== -1) {
    const countSql = /* sql */ `
      SELECT
        count(*) AS totalCount
      FROM
        ShiftLog.WorkOrders w
        LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId ${whereClause}
    `

    const countRequest = pool.request()

    applyParameters(countRequest, filters, user)

    const countResult = await countRequest.query<{ totalCount: number }>(
      countSql
    )

    totalCount = countResult.recordset[0].totalCount
  }

  // Main query with limit and offset

  let workOrders: WorkOrder[] = []

  if (totalCount > 0 || limit === -1) {
    const workOrdersRequest = pool.request()

    applyParameters(workOrdersRequest, filters, user)

    const workOrdersResult = await workOrdersRequest.query<WorkOrder>(
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
          w.workOrderPriorityDataListItemId,
          wPriority.dataListItem AS workOrderPriorityDataListItem,
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
          milestones.milestonesCount,
          milestones.milestonesCompletedCount,
          milestones.overdueMilestonesCount
        FROM
          ShiftLog.WorkOrders w
          LEFT JOIN ShiftLog.WorkOrderTypes wType ON w.workOrderTypeId = wType.workOrderTypeId
          LEFT JOIN ShiftLog.DataListItems wPriority ON w.workOrderPriorityDataListItemId = wPriority.dataListItemId
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
              ) AS milestonesCompletedCount,
              sum(
                CASE
                  WHEN milestoneCompleteDateTime IS NULL
                  AND milestoneDueDateTime < getdate() THEN 1
                  ELSE 0
                END
              ) AS overdueMilestonesCount
            FROM
              ShiftLog.WorkOrderMilestones
            WHERE
              recordDelete_dateTime IS NULL
            GROUP BY
              workOrderId
          ) AS milestones ON milestones.workOrderId = w.workOrderId ${whereClause}
        ORDER BY
          CASE
            WHEN w.workOrderDueDateTime < getdate() THEN 0
            ELSE 1
          END,
          w.workOrderDueDateTime,
          w.workOrderOpenDateTime DESC ${limit === -1
            ? ''
            : ` offset ${offset} rows`} ${limit === -1
            ? ''
            : ` fetch next ${limit} rows only`}
      `
    )

    workOrders = workOrdersResult.recordset

    if (limit === -1) {
      totalCount = workOrders.length
    }
  }

  return {
    workOrders,
    totalCount
  }
}
