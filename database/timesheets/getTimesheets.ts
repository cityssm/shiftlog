import type { DateString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Timesheet } from '../../types/record.types.js'

export interface GetTimesheetsFilters {
  timesheetDateString?: DateString
  supervisorEmployeeNumber?: string
  timesheetTypeDataListItemId?: number | string
}

export interface GetTimesheetsOptions {
  limit: number | string
  offset: number | string
}

function buildWhereClause(filters: GetTimesheetsFilters, user?: User): string {
  let whereClause =
    'where t.instance = @instance and t.recordDelete_dateTime is null'

  if (filters.timesheetDateString !== undefined) {
    whereClause += ' and t.timesheetDate = @timesheetDateString'
  }

  if (
    filters.supervisorEmployeeNumber !== undefined &&
    filters.supervisorEmployeeNumber !== ''
  ) {
    whereClause += ' and t.supervisorEmployeeNumber = @supervisorEmployeeNumber'
  }

  if (
    filters.timesheetTypeDataListItemId !== undefined &&
    filters.timesheetTypeDataListItemId !== ''
  ) {
    whereClause +=
      ' and t.timesheetTypeDataListItemId = @timesheetTypeDataListItemId'
  }

  if (user !== undefined) {
    whereClause += /* sql */ `
      AND (
        tType.userGroupId IS NULL
        OR tType.userGroupId IN (
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

export default async function getTimesheets(
  filters: GetTimesheetsFilters,
  options: GetTimesheetsOptions,
  user?: User
): Promise<{
  timesheets: Timesheet[]
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
      SELECT
        count(*) AS totalCount
      FROM
        ShiftLog.Timesheets t
        LEFT JOIN ShiftLog.DataListItems tType ON t.timesheetTypeDataListItemId = tType.dataListItemId ${whereClause}
    `

    const countResult = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('timesheetDateString', filters.timesheetDateString ?? null)
      .input(
        'supervisorEmployeeNumber',
        filters.supervisorEmployeeNumber ?? null
      )
      .input(
        'timesheetTypeDataListItemId',
        filters.timesheetTypeDataListItemId ?? null
      )
      .input('userName', user?.userName)
      .query(countSql)

    totalCount = countResult.recordset[0]?.totalCount ?? 0
  }

  // Main query with limit and offset

  let timesheets: Timesheet[] = []

  if (totalCount > 0 || limit === -1) {
    const timesheetsResult = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('timesheetDateString', filters.timesheetDateString ?? null)
      .input(
        'supervisorEmployeeNumber',
        filters.supervisorEmployeeNumber ?? null
      )
      .input(
        'timesheetTypeDataListItemId',
        filters.timesheetTypeDataListItemId ?? null
      )
      .input('userName', user?.userName)
      .query<Timesheet>(/* sql */ `
        SELECT
          t.timesheetId,
          t.timesheetDate,
          t.timesheetTypeDataListItemId,
          tType.dataListItem AS timesheetTypeDataListItem,
          t.supervisorEmployeeNumber,
          e.firstName AS supervisorFirstName,
          e.lastName AS supervisorLastName,
          e.userName AS supervisorUserName,
          t.timesheetTitle,
          t.timesheetNote,
          t.shiftId,
          t.recordSubmitted_dateTime,
          t.recordSubmitted_userName,
          t.employeesEntered_dateTime,
          t.employeesEntered_userName,
          t.equipmentEntered_dateTime,
          t.equipmentEntered_userName
        FROM
          ShiftLog.Timesheets t
          LEFT JOIN ShiftLog.DataListItems tType ON t.timesheetTypeDataListItemId = tType.dataListItemId
          LEFT JOIN ShiftLog.Employees e ON t.instance = e.instance
          AND t.supervisorEmployeeNumber = e.employeeNumber ${whereClause}
        ORDER BY
          t.timesheetDate DESC,
          tType.dataListItem,
          t.timesheetTitle ${limit === -1
          ? ''
          : ` offset ${offset} rows`} ${limit === -1
          ? ''
          : ` fetch next ${limit} rows only`}
      `)

    timesheets = timesheetsResult.recordset

    if (limit === -1) {
      totalCount = timesheets.length
    }
  }

  return {
    timesheets,
    totalCount
  }
}
