import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

export default async function getWorkOrderType(
  workOrderTypeId: number | string
): Promise<WorkOrderType | undefined> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderTypeId', workOrderTypeId).query(/* sql */ `
      select
        wt.workOrderTypeId,
        wt.workOrderType,
        wt.workOrderNumberPrefix,
        wt.orderNumber,
        wt.userGroupId,
        ug.userGroupName
      from ShiftLog.WorkOrderTypes wt
      left join ShiftLog.UserGroups ug
        on wt.userGroupId = ug.userGroupId
      where wt.instance = @instance
        and wt.workOrderTypeId = @workOrderTypeId
        and wt.recordDelete_dateTime is null
    `)) as mssql.IResult<WorkOrderType>

  return result.recordset[0]
}
