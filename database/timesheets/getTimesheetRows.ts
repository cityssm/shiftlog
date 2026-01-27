import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { TimesheetRow } from '../../types/record.types.js'

export interface GetTimesheetRowsFilters {
  employeeNumberFilter?: string
  equipmentNumberFilter?: string
  onlyWithData?: boolean
  onlyEmployees?: boolean
  onlyEquipment?: boolean
}

export default async function getTimesheetRows(
  timesheetId: number | string,
  filters?: GetTimesheetRowsFilters
): Promise<TimesheetRow[]> {
  const pool = await getShiftLogConnectionPool()

  let whereClause =
    'where tr.instance = @instance and tr.timesheetId = @timesheetId'

  if (filters?.employeeNumberFilter) {
    whereClause +=
      " AND (tr.employeeNumber = @employeeNumberFilter OR e.firstName + ' ' + e.lastName LIKE '%' + @employeeNumberFilter + '%')"
  }

  if (filters?.equipmentNumberFilter) {
    whereClause +=
      " AND (tr.equipmentNumber = @equipmentNumberFilter OR eq.equipmentName LIKE '%' + @equipmentNumberFilter + '%')"
  }

  if (filters?.onlyEmployees) {
    whereClause += ' AND tr.employeeNumber IS NOT NULL'
  }

  if (filters?.onlyEquipment) {
    whereClause += ' AND tr.equipmentNumber IS NOT NULL'
  }

  if (filters?.onlyWithData) {
    whereClause += /* sql */ `
      AND EXISTS (
        SELECT
          1
        FROM
          ShiftLog.TimesheetCells tc
        WHERE
          tc.timesheetRowId = tr.timesheetRowId
          AND tc.recordHours > 0
      )
    `
  }

  const sql = /* sql */ `
    SELECT
      tr.timesheetRowId,
      tr.timesheetId,
      tr.rowTitle,
      tr.employeeNumber,
      e.firstName AS employeeFirstName,
      e.lastName AS employeeLastName,
      e.userGroupId,
      tr.equipmentNumber,
      eq.equipmentName,
      tr.jobClassificationDataListItemId,
      jc.dataListItem AS jobClassificationDataListItem,
      tr.timeCodeDataListItemId,
      tc.dataListItem AS timeCodeDataListItem
    FROM
      ShiftLog.TimesheetRows tr
      LEFT JOIN ShiftLog.Employees e ON tr.instance = e.instance
      AND tr.employeeNumber = e.employeeNumber
      LEFT JOIN ShiftLog.Equipment eq ON tr.instance = eq.instance
      AND tr.equipmentNumber = eq.equipmentNumber
      LEFT JOIN ShiftLog.DataListItems jc ON tr.jobClassificationDataListItemId = jc.dataListItemId
      LEFT JOIN ShiftLog.DataListItems tc ON tr.timeCodeDataListItemId = tc.dataListItemId ${whereClause}
    ORDER BY
      CASE
        WHEN tr.employeeNumber IS NOT NULL THEN 0
        ELSE 1
      END,
      e.lastName,
      e.firstName,
      eq.equipmentName,
      tr.timesheetRowId
  `

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('timesheetId', timesheetId)
    .input('employeeNumberFilter', filters?.employeeNumberFilter ?? undefined)
    .input('equipmentNumberFilter', filters?.equipmentNumberFilter ?? undefined)
    .query(sql)) as mssql.IResult<TimesheetRow>

  return result.recordset
}
