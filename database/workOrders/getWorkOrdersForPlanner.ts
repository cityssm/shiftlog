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
    whereClause += ` and (
      w.assignedToId is null
      or exists (
        select 1 from ShiftLog.WorkOrderMilestones
        where workOrderId = w.workOrderId
          and assignedToId is null
          and recordDelete_dateTime is null
      )
    )`
  } else if (
    filters.assignedToId !== undefined &&
    filters.assignedToId !== ''
  ) {
    whereClause += ` and (
      w.assignedToId = @assignedToId
      or exists (
        select 1 from ShiftLog.WorkOrderMilestones
        where workOrderId = w.workOrderId
          and assignedToId = @assignedToId
          and recordDelete_dateTime is null
      )
    )`
  }

  // Handle date filters
  if (filters.dateFilter !== undefined && filters.dateFilter !== '') {
    switch (filters.dateFilter) {
      case 'dueInDays': {
        whereClause += ` and w.workOrderDueDateTime is not null
          and datediff(day, getdate(), w.workOrderDueDateTime) <= @daysThreshold
          and w.workOrderDueDateTime >= getdate()`
        break
      }
      case 'milestonesDueInDays': {
        whereClause += ` and exists (
          select 1 from ShiftLog.WorkOrderMilestones
          where workOrderId = w.workOrderId
            and milestoneCompleteDateTime is null
            and milestoneDueDateTime is not null
            and datediff(day, getdate(), milestoneDueDateTime) <= @daysThreshold
            and milestoneDueDateTime >= getdate()
            and recordDelete_dateTime is null
        )`
        break
      }
      case 'milestonesOverdue': {
        whereClause += ` and exists (
          select 1 from ShiftLog.WorkOrderMilestones
          where workOrderId = w.workOrderId
            and milestoneCompleteDateTime is null
            and milestoneDueDateTime < getdate()
            and recordDelete_dateTime is null
        )`
        break
      }
      case 'noUpdatesForDays': {
        whereClause += ` and (
          w.recordUpdate_dateTime is null
          or datediff(day, w.recordUpdate_dateTime, getdate()) >= @daysThreshold
        )`
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
    whereClause += `
      and (
        wType.userGroupId is null or wType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
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
      select count(*) as totalCount
      from ShiftLog.WorkOrders w
      left join ShiftLog.WorkOrderTypes wType
        on w.workOrderTypeId = wType.workOrderTypeId
      ${whereClause}
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

    const workOrdersResult =
      await workOrdersRequest.query<WorkOrder>(/* sql */ `
        select
          w.workOrderId,

          w.workOrderNumberPrefix,
          w.workOrderNumberYear,
          w.workOrderNumberSequence,
          w.workOrderNumberOverride,
          w.workOrderNumber,

          w.workOrderTypeId,
          wType.workOrderType,

          w.workOrderPriorityDataListItemId,
          wPriority.dataListItem as workOrderPriorityDataListItem,

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

          w.assignedToId,
          assignedTo.assignedToName,

          milestones.milestonesCount,
          milestones.milestonesCompletedCount,
          milestones.overdueMilestonesCount
          
        from ShiftLog.WorkOrders w

        left join ShiftLog.WorkOrderTypes wType
          on w.workOrderTypeId = wType.workOrderTypeId

        left join ShiftLog.DataListItems wPriority
          on w.workOrderPriorityDataListItemId = wPriority.dataListItemId

        left join ShiftLog.DataListItems wStatus
          on w.workOrderStatusDataListItemId = wStatus.dataListItemId

        left join ShiftLog.AssignedTo assignedTo
          on w.assignedToId = assignedTo.assignedToId

        left join (
          select workOrderId,
            count(*) as milestonesCount,
            sum(
              case when milestoneCompleteDateTime is null then 0 else 1 end
            ) as milestonesCompletedCount,
            sum(
              case when milestoneCompleteDateTime is null and milestoneDueDateTime < getdate() then 1 else 0 end
            ) as overdueMilestonesCount
          from ShiftLog.WorkOrderMilestones
          where recordDelete_dateTime is null
          group by workOrderId
        ) as milestones on milestones.workOrderId = w.workOrderId

        ${whereClause}    

        order by 
          case when w.workOrderDueDateTime < getdate() then 0 else 1 end,
          w.workOrderDueDateTime,
          w.workOrderOpenDateTime desc

        ${limit === -1 ? '' : ` offset ${offset} rows`}
        ${limit === -1 ? '' : ` fetch next ${limit} rows only`}
      `)

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
