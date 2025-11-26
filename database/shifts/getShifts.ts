// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */

import type { mssql } from '@cityssm/mssql-multi-pool'
import type { DateString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Shift } from '../../types/record.types.js'

export interface GetShiftsFilters {
  shiftDateString?: DateString
}

export interface GetShiftsOptions {
  limit: number | string
  offset: number | string
}

function buildWhereClause(filters: GetShiftsFilters, user?: User): string {
  let whereClause = 'where s.instance = @instance and s.recordDelete_dateTime is null'

  if (filters.shiftDateString !== undefined) {
    whereClause += ' and s.shiftDate = @shiftDateString'
  }

  if (user !== undefined) {
    whereClause += `
      and (
        sType.userGroupId is null or sType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        )
      )
    `
  }

  return whereClause
}

export default async function getShifts(
  filters: GetShiftsFilters,
  options: GetShiftsOptions,
  user?: User
): Promise<{
  shifts: Shift[]
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
      from ShiftLog.Shifts s
      left join ShiftLog.DataListItems sType
        on s.shiftTypeDataListItemId = sType.dataListItemId
      ${whereClause}
    `

    const countResult = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('shiftDateString', filters.shiftDateString ?? null)
      .input('userName', user?.userName)
      .query(countSql)

    totalCount = countResult.recordset[0]?.totalCount ?? 0
  }

  // Main query with limit and offset

  let shifts: Shift[] = []

  if (totalCount > 0 || limit === -1) {
    const shiftsResult = (await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('shiftDateString', filters.shiftDateString ?? null)
      .input('userName', user?.userName).query(/* sql */ `
        select
          s.shiftId, s.shiftDate,

          s.shiftTimeDataListItemId,
          sTime.dataListItem as shiftTimeDataListItem,

          s.shiftTypeDataListItemId,
          sType.dataListItem as shiftTypeDataListItem,
          
          s.supervisorEmployeeNumber,
          e.firstName as supervisorFirstName,
          e.lastName as supervisorLastName,
          e.userName as supervisorUserName,

          s.shiftDescription

        from ShiftLog.Shifts s

        left join ShiftLog.DataListItems sTime
          on s.shiftTimeDataListItemId = sTime.dataListItemId

        left join ShiftLog.DataListItems sType
          on s.shiftTypeDataListItemId = sType.dataListItemId
          
        left join ShiftLog.Employees e
          on s.instance = e.instance
          and s.supervisorEmployeeNumber = e.employeeNumber

        ${whereClause}    

        order by s.shiftDate desc, sType.dataListItem, sTime.dataListItem

        ${limit === -1 ? '' : ' offset ' + offset + ' rows'}
        ${limit === -1 ? '' : ' fetch next ' + limit + ' rows only'}
      `)) as mssql.IResult<Shift>

    shifts = shiftsResult.recordset

    if (limit === -1) {
      totalCount = shifts.length
    }
  }

  return {
    shifts,
    totalCount
  }
}
