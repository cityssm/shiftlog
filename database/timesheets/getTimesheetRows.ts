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
      " and (tr.employeeNumber = @employeeNumberFilter or e.firstName + ' ' + e.lastName like '%' + @employeeNumberFilter + '%')"
  }

  if (filters?.equipmentNumberFilter) {
    whereClause +=
      " and (tr.equipmentNumber = @equipmentNumberFilter or eq.equipmentName like '%' + @equipmentNumberFilter + '%')"
  }

  if (filters?.onlyEmployees) {
    whereClause += ' and tr.employeeNumber is not null'
  }

  if (filters?.onlyEquipment) {
    whereClause += ' and tr.equipmentNumber is not null'
  }

  if (filters?.onlyWithData) {
    whereClause += ` and exists (
      select 1 from ShiftLog.TimesheetCells tc
      where tc.timesheetRowId = tr.timesheetRowId
        and tc.recordHours > 0
    )`
  }

  const sql = /* sql */ `
    select
      tr.timesheetRowId,
      tr.timesheetId,
      tr.rowTitle,
      tr.employeeNumber,
      e.firstName as employeeFirstName,
      e.lastName as employeeLastName,
      e.userGroupId,
      tr.equipmentNumber,
      eq.equipmentName,
      tr.jobClassificationDataListItemId,
      jc.dataListItem as jobClassificationDataListItem,
      tr.timeCodeDataListItemId,
      tc.dataListItem as timeCodeDataListItem
    from ShiftLog.TimesheetRows tr
    left join ShiftLog.Employees e
      on tr.instance = e.instance and tr.employeeNumber = e.employeeNumber
    left join ShiftLog.Equipment eq
      on tr.instance = eq.instance and tr.equipmentNumber = eq.equipmentNumber
    left join ShiftLog.DataListItems jc
      on tr.jobClassificationDataListItemId = jc.dataListItemId
    left join ShiftLog.DataListItems tc
      on tr.timeCodeDataListItemId = tc.dataListItemId
    ${whereClause}
    order by
      case when tr.employeeNumber is not null then 0 else 1 end,
      e.lastName, e.firstName,
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
