import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Equipment } from '../../types/record.types.js'

interface GetEquipmentListFilters {
  equipmentNumber?: string
  includeDeleted?: boolean
}

export default async function getEquipmentList(
  filters: GetEquipmentListFilters = {}
): Promise<Equipment[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const result = (await pool
    .request()
    .input('equipmentNumber', filters.equipmentNumber).query(/* sql */ `
      select e.equipmentNumber, e.equipmentName, e.equipmentDescription,
        e.equipmentTypeDataListItemId, e.userGroupId,
        ug.userGroupName,
        recordSync_isSynced, recordSync_source, recordSync_dateTime,
        e.recordCreate_userName, e.recordCreate_dateTime,
        e.recordUpdate_userName, e.recordUpdate_dateTime
      from ShiftLog.Equipment e
      left join ShiftLog.UserGroups ug on e.userGroupId = ug.userGroupId
      where
        ${(filters.includeDeleted ?? false) ? '1=1' : 'e.recordDelete_dateTime is null'}
        ${filters.equipmentNumber === undefined ? '' : `and e.equipmentNumber = @equipmentNumber`}
      order by e.equipmentNumber, e.equipmentName
    `)) as mssql.IResult<Equipment>

  return result.recordset
}
