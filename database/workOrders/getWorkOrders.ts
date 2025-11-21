// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets, unicorn/no-null */

import type { mssql } from '@cityssm/mssql-multi-pool'

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrder } from '../../types/record.types.js'

export interface GetWorkOrdersFilters {
  workOrderNumber?: string
  workOrderTypeDataListItemId?: number | string
  workOrderStatusDataListItemId?: number | string
  requestorName?: string
}

export interface GetWorkOrdersOptions {
  limit: number | string
  offset: number | string
}

function buildWhereClause(filters: GetWorkOrdersFilters, user?: User): string {
  let whereClause = 'where w.recordDelete_dateTime is null'

  if (filters.workOrderNumber !== undefined && filters.workOrderNumber !== '') {
    whereClause += ' and w.workOrderNumber like @workOrderNumber'
  }

  if (
    filters.workOrderTypeDataListItemId !== undefined &&
    filters.workOrderTypeDataListItemId !== ''
  ) {
    whereClause += ' and w.workOrderTypeDataListItemId = @workOrderTypeDataListItemId'
  }

  if (
    filters.workOrderStatusDataListItemId !== undefined &&
    filters.workOrderStatusDataListItemId !== ''
  ) {
    whereClause += ' and w.workOrderStatusDataListItemId = @workOrderStatusDataListItemId'
  }

  if (filters.requestorName !== undefined && filters.requestorName !== '') {
    whereClause += ' and w.requestorName like @requestorName'
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
      left join ShiftLog.DataListItems wType
        on w.workOrderTypeDataListItemId = wType.dataListItemId
      ${whereClause}
    `

    const countResult = await pool
      .request()
      .input('workOrderNumber', filters.workOrderNumber === undefined ? null : `%${filters.workOrderNumber}%`)
      .input('workOrderTypeDataListItemId', filters.workOrderTypeDataListItemId ?? null)
      .input('workOrderStatusDataListItemId', filters.workOrderStatusDataListItemId ?? null)
      .input('requestorName', filters.requestorName === undefined ? null : `%${filters.requestorName}%`)
      .input('userName', user?.userName)
      .query(countSql)

    totalCount = countResult.recordset[0]?.totalCount ?? 0
  }

  // Main query with limit and offset

  let workOrders: WorkOrder[] = []

  if (totalCount > 0 || limit === -1) {
    const workOrdersResult = (await pool
      .request()
      .input('workOrderNumber', filters.workOrderNumber === undefined ? null : `%${filters.workOrderNumber}%`)
      .input('workOrderTypeDataListItemId', filters.workOrderTypeDataListItemId ?? null)
      .input('workOrderStatusDataListItemId', filters.workOrderStatusDataListItemId ?? null)
      .input('requestorName', filters.requestorName === undefined ? null : `%${filters.requestorName}%`)
      .input('userName', user?.userName).query(/* sql */ `
        select
          w.workOrderId,
          w.workOrderNumberYear,
          w.workOrderNumberSequence,
          w.workOrderNumber,

          w.workOrderTypeDataListItemId,
          wType.dataListItem as workOrderTypeDataListItem,

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
          assignedTo.dataListItem as assignedToDataListItem
        from ShiftLog.WorkOrders w

        left join ShiftLog.DataListItems wType
          on w.workOrderTypeDataListItemId = wType.dataListItemId

        left join ShiftLog.DataListItems wStatus
          on w.workOrderStatusDataListItemId = wStatus.dataListItemId

        left join ShiftLog.DataListItems assignedTo
          on w.assignedToDataListItemId = assignedTo.dataListItemId

        ${whereClause}    

        order by w.workOrderOpenDateTime desc, w.workOrderNumber desc

        ${limit === -1 ? '' : ' offset ' + offset + ' rows'}
        ${limit === -1 ? '' : ' fetch next ' + limit + ' rows only'}
      `)) as mssql.IResult<WorkOrder>

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
