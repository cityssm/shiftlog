import type { DateString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Shift } from '../../types/record.types.js'

export interface GetShiftsFilters {
  shiftDateString?: '' | DateString

  shiftTypeDataListItemId?: number | string
  supervisorEmployeeNumber?: string
}

export interface GetShiftsOptions {
  limit: number | string
  offset: number | string
}

function buildWhereClause(filters: GetShiftsFilters, user?: User): string {
  let whereClause =
    'WHERE s.instance = @instance AND s.recordDelete_dateTime IS NULL'

  if (filters.shiftDateString !== undefined && filters.shiftDateString !== '') {
    whereClause += ' AND s.shiftDate = @shiftDateString'
  }

  if (
    filters.shiftTypeDataListItemId !== undefined &&
    filters.shiftTypeDataListItemId !== ''
  ) {
    whereClause += ' AND s.shiftTypeDataListItemId = @shiftTypeDataListItemId'
  }

  if (
    filters.supervisorEmployeeNumber !== undefined &&
    filters.supervisorEmployeeNumber !== ''
  ) {
    whereClause += ' AND s.supervisorEmployeeNumber = @supervisorEmployeeNumber'
  }

  if (user !== undefined) {
    whereClause += /* sql */ `
      AND (
        sType.userGroupId IS NULL
        OR sType.userGroupId IN (
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
      SELECT
        count(*) AS totalCount
      FROM
        ShiftLog.Shifts s
        LEFT JOIN ShiftLog.DataListItems sType ON s.shiftTypeDataListItemId = sType.dataListItemId ${whereClause}
    `

    const countResult = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('shiftDateString', filters.shiftDateString ?? null)
      .input('shiftTypeDataListItemId', filters.shiftTypeDataListItemId ?? null)
      .input(
        'supervisorEmployeeNumber',
        filters.supervisorEmployeeNumber ?? null
      )
      .input('userName', user?.userName)
      .query(countSql)

    totalCount = countResult.recordset[0]?.totalCount ?? 0
  }

  // Main query with limit and offset

  let shifts: Shift[] = []

  if (totalCount > 0 || limit === -1) {
    const shiftsResult = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('shiftDateString', filters.shiftDateString ?? null)
      .input('shiftTypeDataListItemId', filters.shiftTypeDataListItemId ?? null)
      .input(
        'supervisorEmployeeNumber',
        filters.supervisorEmployeeNumber ?? null
      )
      .input('userName', user?.userName)
      .query<Shift>(/* sql */ `
        SELECT
          s.shiftId,
          s.shiftDate,
          s.shiftTimeDataListItemId,
          sTime.dataListItem AS shiftTimeDataListItem,
          s.shiftTypeDataListItemId,
          sType.dataListItem AS shiftTypeDataListItem,
          s.supervisorEmployeeNumber,
          e.firstName AS supervisorFirstName,
          e.lastName AS supervisorLastName,
          e.userName AS supervisorUserName,
          s.shiftDescription,
          -- Counts
          (
            SELECT
              count(*)
            FROM
              ShiftLog.ShiftWorkOrders wo
            WHERE
              wo.shiftId = s.shiftId
          ) AS workOrdersCount,
          (
            SELECT
              count(*)
            FROM
              ShiftLog.ShiftEmployees se
            WHERE
              se.shiftId = s.shiftId
          ) AS employeesCount,
          (
            SELECT
              count(*)
            FROM
              ShiftLog.ShiftCrews sc
            WHERE
              sc.shiftId = s.shiftId
          ) AS crewsCount,
          (
            SELECT
              count(*)
            FROM
              ShiftLog.ShiftEquipment seq
            WHERE
              seq.shiftId = s.shiftId
          ) AS equipmentCount,
          (
            SELECT
              count(*)
            FROM
              ShiftLog.ShiftNotes sn
            WHERE
              sn.shiftId = s.shiftId
              AND sn.recordDelete_dateTime IS NULL
          ) AS notesCount,
          (
            SELECT
              count(*)
            FROM
              ShiftLog.Timesheets t
            WHERE
              t.shiftId = s.shiftId
              AND t.recordDelete_dateTime IS NULL
          ) AS timesheetsCount
        FROM
          ShiftLog.Shifts s
          LEFT JOIN ShiftLog.DataListItems sTime ON s.shiftTimeDataListItemId = sTime.dataListItemId
          LEFT JOIN ShiftLog.DataListItems sType ON s.shiftTypeDataListItemId = sType.dataListItemId
          LEFT JOIN ShiftLog.Employees e ON s.instance = e.instance
          AND s.supervisorEmployeeNumber = e.employeeNumber ${whereClause}
        ORDER BY
          s.shiftDate DESC,
          sType.dataListItem,
          sTime.dataListItem ${limit === -1
            ? ''
            : ` offset ${offset} rows`} ${limit === -1
            ? ''
            : ` fetch next ${limit} rows only`}
      `)

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
