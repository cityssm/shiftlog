// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */

import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

export interface GetWorkOrdersFilters {
  assignedToDataListItemId?: number | string
  openClosedFilter?: '' | 'closed' | 'open' | 'overdue'

  searchString?: string

  requestor?: string
  requestorName?: string
  workOrderNumber?: string
  workOrderStatusDataListItemId?: number | string
  workOrderTypeId?: number | string
  tagName?: string
}

export interface GetWorkOrdersOptions {
  limit: number | string
  offset: number | string

  includeMoreInfoFormData?: boolean
}

function buildWhereClause(filters: GetWorkOrdersFilters, user?: User): string {
  let whereClause =
    'where w.instance = @instance and w.recordDelete_dateTime is null'

  if (filters.workOrderNumber !== undefined && filters.workOrderNumber !== '') {
    whereClause += ' and w.workOrderNumber like @workOrderNumber'
  }

  if (filters.workOrderTypeId !== undefined && filters.workOrderTypeId !== '') {
    whereClause += ' and w.workOrderTypeId = @workOrderTypeId'
  }

  if (
    filters.workOrderStatusDataListItemId !== undefined &&
    filters.workOrderStatusDataListItemId !== ''
  ) {
    whereClause +=
      ' and w.workOrderStatusDataListItemId = @workOrderStatusDataListItemId'
  }

  if (filters.requestorName !== undefined && filters.requestorName !== '') {
    whereClause += ' and w.requestorName like @requestorName'
  }

  if (filters.requestor !== undefined && filters.requestor !== '') {
    whereClause +=
      ' and (w.requestorName like @requestor or w.requestorContactInfo like @requestor)'
  }

  if (
    filters.assignedToDataListItemId !== undefined &&
    filters.assignedToDataListItemId !== ''
  ) {
    whereClause += ` and (w.assignedToDataListItemId = @assignedToDataListItemId
      or w.workOrderId in (
        select workOrderId from ShiftLog.WorkOrderMilestones
        where assignedToDataListItemId = @assignedToDataListItemId
          and recordDelete_dateTime is null
      )
    )`
  }

  if (
    filters.openClosedFilter !== undefined &&
    filters.openClosedFilter !== ''
  ) {
    switch (filters.openClosedFilter) {
      case 'closed': {
        whereClause += ' and w.workOrderCloseDateTime is not null'

        break
      }
      case 'open': {
        whereClause += ' and w.workOrderCloseDateTime is null'

        break
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
          `

        break
      }
    }
  }

  if (filters.searchString !== undefined && filters.searchString !== '') {
    whereClause += ` and (
      w.workOrderNumber like @searchString
      or w.requestorName like @searchString
      or w.requestorContactInfo like @searchString
      or w.workOrderDetails like @searchString
    )`
  }

  if (filters.tagName !== undefined && filters.tagName !== '') {
    whereClause += ` and w.workOrderId in (
      select workOrderId
      from ShiftLog.WorkOrderTags
      where tagName = @tagName
    )`
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
  filters: GetWorkOrdersFilters,
  user?: User
): void {
  sqlRequest
    .input('instance', getConfigProperty('application.instance'))
    .input(
      'workOrderNumber',
      filters.workOrderNumber === undefined
        ? null
        : `%${filters.workOrderNumber}%`
    )
    .input('workOrderTypeId', filters.workOrderTypeId ?? null)
    .input(
      'workOrderStatusDataListItemId',
      filters.workOrderStatusDataListItemId ?? null
    )
    .input(
      'requestorName',
      filters.requestorName === undefined ? null : `%${filters.requestorName}%`
    )
    .input(
      'requestor',
      filters.requestor === undefined ? null : `%${filters.requestor}%`
    )
    .input('assignedToDataListItemId', filters.assignedToDataListItemId ?? null)
    .input(
      'searchString',
      filters.searchString === undefined ? null : `%${filters.searchString}%`
    )
    .input('tagName', filters.tagName ?? null)
    .input('userName', user?.userName)
}

export default async function getWorkOrders(
  filters: GetWorkOrdersFilters,
  options: GetWorkOrdersOptions,
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

  // Get total count if limit === -1

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

          w.workOrderStatusDataListItemId,
          wStatus.dataListItem as workOrderStatusDataListItem,

          w.workOrderPriorityDataListItemId,
          wPriority.dataListItem as workOrderPriorityDataListItem,

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

          ${
            options.includeMoreInfoFormData === true
              ? 'w.moreInfoFormDataJson,'
              : ''
          }

          milestones.milestonesCount,
          milestones.milestonesCompletedCount,

          attachments.attachmentsCount,
          thumbnails.thumbnailAttachmentId,
          notes.notesCount,
          costs.costsCount,
          costs.costsTotal
          
        from ShiftLog.WorkOrders w

        left join ShiftLog.WorkOrderTypes wType
          on w.workOrderTypeId = wType.workOrderTypeId

        left join ShiftLog.DataListItems wStatus
          on w.workOrderStatusDataListItemId = wStatus.dataListItemId

        left join ShiftLog.DataListItems wPriority
          on w.workOrderPriorityDataListItemId = wPriority.dataListItemId

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

        left join (
          select workOrderId,
            count(*) as attachmentsCount
          from ShiftLog.WorkOrderAttachments
          where recordDelete_dateTime is null
          group by workOrderId
        ) as attachments on attachments.workOrderId = w.workOrderId

        left join (
          select workOrderId,
            workOrderAttachmentId as thumbnailAttachmentId
          from ShiftLog.WorkOrderAttachments
          where recordDelete_dateTime is null
            and isWorkOrderThumbnail = 1
        ) as thumbnails on thumbnails.workOrderId = w.workOrderId

        left join (
          select workOrderId,
            count(*) as notesCount
          from ShiftLog.WorkOrderNotes
          where recordDelete_dateTime is null
          group by workOrderId
        ) as notes on notes.workOrderId = w.workOrderId

        left join (
          select workOrderId,
            count(*) as costsCount,
            sum(costAmount) as costsTotal
          from ShiftLog.WorkOrderCosts
          where recordDelete_dateTime is null
          group by workOrderId
        ) as costs on costs.workOrderId = w.workOrderId

        ${whereClause}    

        order by w.workOrderOpenDateTime desc, w.workOrderNumberYear desc, w.workOrderNumberSequence desc

        ${limit === -1 ? '' : ` offset ${offset} rows`}
        ${limit === -1 ? '' : ` fetch next ${limit} rows only`}
      `)

    workOrders = workOrdersResult.recordset

    if (limit === -1) {
      totalCount = workOrders.length
    }

    if (options.includeMoreInfoFormData === true) {
      for (const workOrder of workOrders) {
        if (workOrder.moreInfoFormDataJson === undefined) {
          workOrder.moreInfoFormData = {}
        } else {
          try {
            workOrder.moreInfoFormData = JSON.parse(
              workOrder.moreInfoFormDataJson
            ) as Record<string, unknown>
          } catch {
            workOrder.moreInfoFormData = {}
          }
        }
      }
    }

    // Fetch tags for all work orders
    if (workOrders.length > 0) {
      const workOrderIds = workOrders.map((wo) => wo.workOrderId)
      const tagsRequest = pool.request()
      tagsRequest.input('instance', getConfigProperty('application.instance'))

      // Build parameterized IN clause
      const parameterNames = workOrderIds.map((_, index) => `@workOrderId${index}`)
      workOrderIds.forEach((id, index) => {
        tagsRequest.input(`workOrderId${index}`, id)
      })

      const tagsResult = await tagsRequest.query<{
        workOrderId: number
        tagName: string
        tagBackgroundColor?: string
        tagTextColor?: string
      }>(/* sql */ `
        SELECT wot.workOrderId, wot.tagName,
               t.tagBackgroundColor, t.tagTextColor
        FROM ShiftLog.WorkOrderTags wot
        LEFT JOIN ShiftLog.Tags t ON wot.tagName = t.tagName AND t.instance = @instance AND t.recordDelete_dateTime IS NULL
        WHERE wot.workOrderId IN (${parameterNames.join(',')})
        ORDER BY wot.workOrderId, wot.tagName
      `)

      // Group tags by workOrderId
      const tagsByWorkOrder = new Map<
        number,
        Array<{
          workOrderId: number
          tagName: string
          tagBackgroundColor?: string
          tagTextColor?: string
        }>
      >()

      for (const tag of tagsResult.recordset) {
        if (!tagsByWorkOrder.has(tag.workOrderId)) {
          tagsByWorkOrder.set(tag.workOrderId, [])
        }
        tagsByWorkOrder.get(tag.workOrderId)?.push(tag)
      }

      // Assign tags to work orders
      for (const workOrder of workOrders) {
        workOrder.tags = tagsByWorkOrder.get(workOrder.workOrderId) ?? []
      }
    }
  }

  return {
    workOrders,
    totalCount
  }
}
