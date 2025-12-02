import type { mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function reopenWorkOrder(
  workOrderId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = (await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName).query(/* sql */ `
      update ShiftLog.WorkOrders
      set
        workOrderCloseDateTime = null,
        recordUpdate_userName = @userName,
        recordUpdate_dateTime = getdate()
      where workOrderId = @workOrderId
        and instance = @instance
        and workOrderCloseDateTime is not null
        and recordDelete_dateTime is null
    `)) as mssql.IResult<Record<string, never>>

  return result.rowsAffected[0] > 0
}
