import type { DateString } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Shift } from '../../types/record.types.js'

export interface GetPreviousShiftsFilters {
  currentShiftId: number | string
  shiftDateString?: '' | DateString
  shiftTimeDataListItemId?: number | string
  shiftTypeDataListItemId?: number | string
  supervisorEmployeeNumber?: string
}

const maxResults = 10

export default async function getPreviousShifts(
  filters: GetPreviousShiftsFilters,
  user: User
): Promise<Shift[]> {
  const pool = await getShiftLogConnectionPool()

  let whereClause = /* sql */ `
    WHERE
      s.instance = @instance
      AND s.recordDelete_dateTime IS NULL
      AND s.shiftId <> @currentShiftId
  `

  // Add optional filters
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

  if (
    filters.shiftTimeDataListItemId !== undefined &&
    filters.shiftTimeDataListItemId !== ''
  ) {
    whereClause += ' AND s.shiftTimeDataListItemId = @shiftTimeDataListItemId'
  }

  if (filters.shiftDateString !== undefined && filters.shiftDateString !== '') {
    whereClause += ' AND s.shiftDate < @shiftDateString'
  }

  // User group filter
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

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('currentShiftId', filters.currentShiftId)
    .input(
      'shiftTypeDataListItemId',
      filters.shiftTypeDataListItemId ?? undefined
    )
    .input(
      'supervisorEmployeeNumber',
      filters.supervisorEmployeeNumber ?? undefined
    )
    .input(
      'shiftTimeDataListItemId',
      filters.shiftTimeDataListItemId ?? undefined
    )
    .input('shiftDateString', filters.shiftDateString ?? undefined)
    .input('userName', user.userName)
    .query<Shift>(/* sql */ `
      SELECT
        TOP ${maxResults} s.shiftId,
        s.shiftDate,
        s.shiftTimeDataListItemId,
        sTime.dataListItem AS shiftTimeDataListItem,
        s.shiftTypeDataListItemId,
        sType.dataListItem AS shiftTypeDataListItem,
        s.supervisorEmployeeNumber,
        e.firstName AS supervisorFirstName,
        e.lastName AS supervisorLastName,
        s.shiftDescription,
        -- Counts
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
            ShiftLog.ShiftEmployees se
          WHERE
            se.shiftId = s.shiftId
        ) AS employeesCount,
        (
          SELECT
            count(*)
          FROM
            ShiftLog.ShiftEquipment seq
          WHERE
            seq.shiftId = s.shiftId
        ) AS equipmentCount
      FROM
        ShiftLog.Shifts s
        LEFT JOIN ShiftLog.DataListItems sTime ON s.shiftTimeDataListItemId = sTime.dataListItemId
        LEFT JOIN ShiftLog.DataListItems sType ON s.shiftTypeDataListItemId = sType.dataListItemId
        LEFT JOIN ShiftLog.Employees e ON s.instance = e.instance
        AND s.supervisorEmployeeNumber = e.employeeNumber ${whereClause}
      ORDER BY
        s.shiftDate DESC,
        s.shiftId DESC
    `)

  return result.recordset
}
