import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Equipment } from '../../types/record.types.js'

interface GetEquipmentListFilters {
  equipmentNumber?: string
  includeDeleted?: boolean
}

export default async function getEquipmentList(
  filters: GetEquipmentListFilters = {}
): Promise<Equipment[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('equipmentNumber', filters.equipmentNumber)
    .query<Equipment>(/* sql */ `
      SELECT
        e.equipmentNumber,
        e.equipmentName,
        e.equipmentDescription,
        e.equipmentTypeDataListItemId,
        dli.dataListItem AS equipmentTypeDataListItem,
        e.employeeListId,
        el.employeeListName,
        e.userGroupId,
        ug.userGroupName,
        recordSync_isSynced,
        recordSync_source,
        recordSync_dateTime,
        e.recordCreate_userName,
        e.recordCreate_dateTime,
        e.recordUpdate_userName,
        e.recordUpdate_dateTime
      FROM
        ShiftLog.Equipment e
        LEFT JOIN ShiftLog.DataListItems dli ON e.equipmentTypeDataListItemId = dli.dataListItemId
        LEFT JOIN ShiftLog.EmployeeLists el ON e.employeeListId = el.employeeListId
        AND el.recordDelete_dateTime IS NULL
        LEFT JOIN ShiftLog.UserGroups ug ON e.userGroupId = ug.userGroupId
      WHERE
        e.instance = @instance ${(filters.includeDeleted ?? false)
          ? ''
          : 'and e.recordDelete_dateTime is null'} ${filters.equipmentNumber ===
        undefined
          ? ''
          : 'and e.equipmentNumber = @equipmentNumber'}
      ORDER BY
        e.equipmentNumber,
        e.equipmentName
    `)

  return result.recordset
}
