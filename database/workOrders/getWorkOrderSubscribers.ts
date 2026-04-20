import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { WorkOrderSubscriber } from '../../types/record.types.js'

export default async function getWorkOrderSubscribers(
  workOrderId: number | string
): Promise<WorkOrderSubscriber[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderId', workOrderId)
    .query<WorkOrderSubscriber>(/* sql */ `
      SELECT
        wos.workOrderId,
        wos.subscriberSequence,
        wos.subscriberEmailAddress
      FROM
        ShiftLog.WorkOrderSubscribers wos
        INNER JOIN ShiftLog.WorkOrders wo ON wos.workOrderId = wo.workOrderId
      WHERE
        wo.instance = @instance
        AND wo.recordDelete_dateTime IS NULL
        AND wos.recordDelete_dateTime IS NULL
        AND wos.workOrderId = @workOrderId
      ORDER BY
        wos.subscriberEmailAddress
    `)

  return result.recordset
}
