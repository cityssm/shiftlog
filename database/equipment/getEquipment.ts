import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Equipment } from '../../types/record.types.js'

export default async function getEquipment(): Promise<Equipment[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const result = (await pool.request().query(/* sql */ `
    select e.equipmentNumber, e.equipmentName, e.equipmentDescription,
      e.equipmentTypeDataListItemId, e.userGroupId,
      ug.userGroupName,
      e.recordCreate_userName, e.recordCreate_dateTime,
      e.recordUpdate_userName, e.recordUpdate_dateTime
    from ShiftLog.Equipment e
    left join ShiftLog.UserGroups ug on e.userGroupId = ug.userGroupId
    where e.recordDelete_dateTime is null
    order by e.equipmentName
  `)) as mssql.IResult<Equipment>

  return result.recordset
}
