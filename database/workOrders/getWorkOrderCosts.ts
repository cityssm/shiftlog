import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderCost } from '../../types/record.types.js'

export default async function getWorkOrderCosts(
  workOrderId: number | string
): Promise<WorkOrderCost[]> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .query(/* sql */ `
      select
        c.workOrderCostId,
        c.workOrderId,
        c.costAmount,
        c.costDescription,
        c.recordCreate_userName,
        c.recordCreate_dateTime,
        c.recordUpdate_userName,
        c.recordUpdate_dateTime
      from ShiftLog.WorkOrderCosts c
      where c.workOrderId = @workOrderId
        and c.recordDelete_dateTime is null
        and c.workOrderId in (
          select workOrderId
          from ShiftLog.WorkOrders
          where recordDelete_dateTime is null
            and instance = @instance
        )
      order by c.workOrderCostId
    `)) as mssql.IResult<WorkOrderCost>

  return result.recordset
}
