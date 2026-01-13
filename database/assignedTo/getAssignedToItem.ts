import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { AssignedTo } from '../../types/record.types.js'

export default async function getAssignedToItem(
  assignedToId: number | string
): Promise<AssignedTo | undefined> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('assignedToId', assignedToId).query(/* sql */ `
      select
        a.assignedToId,
        a.assignedToName,
        a.orderNumber,
        a.userGroupId,
        ug.userGroupName,
        a.recordCreate_userName,
        a.recordCreate_dateTime,
        a.recordUpdate_userName,
        a.recordUpdate_dateTime
      from ShiftLog.AssignedTo a
      left join ShiftLog.UserGroups ug on a.userGroupId = ug.userGroupId
      where a.instance = @instance
        and a.assignedToId = @assignedToId
        and a.recordDelete_dateTime is null
    `)) as mssql.IResult<AssignedTo>

  return result.recordset[0]
}
