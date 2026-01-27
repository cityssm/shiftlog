import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteWorkOrderMilestone(
  workOrderMilestoneId: number | string,
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('workOrderMilestoneId', workOrderMilestoneId)
    .input('userName', userName)
    .query(/* sql */ `
      UPDATE ShiftLog.WorkOrderMilestones
      SET
        recordDelete_userName = @userName,
        recordDelete_dateTime = getdate()
      WHERE
        workOrderMilestoneId = @workOrderMilestoneId
        AND recordDelete_dateTime IS NULL
        AND workOrderId IN (
          SELECT
            workOrderId
          FROM
            ShiftLog.WorkOrders
          WHERE
            recordDelete_dateTime IS NULL
            AND instance = @instance
        )
    `)

  return result.rowsAffected[0] > 0
}
