import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteWorkOrder(
  workOrderId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('workOrderId', workOrderId)
    .input('instance', getConfigProperty('application.instance'))
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.WorkOrders
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      WHERE
        workOrderId = @workOrderId
        AND instance = @instance
        AND recordDelete_dateTime IS NULL
    `)

  return result.rowsAffected[0] > 0
}
