import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface MilestoneOrderUpdate {
  workOrderMilestoneId: number | string
  orderNumber: number | string
}

export default async function updateWorkOrderMilestoneOrder(
  milestoneOrders: MilestoneOrderUpdate[],
  userName: string
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  for (const milestoneOrder of milestoneOrders) {
    // eslint-disable-next-line no-await-in-loop
    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('workOrderMilestoneId', milestoneOrder.workOrderMilestoneId)
      .input('orderNumber', milestoneOrder.orderNumber)
      .input('userName', userName)
      .query(/* sql */ `
        UPDATE ShiftLog.WorkOrderMilestones
        SET
          orderNumber = @orderNumber,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
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
  }

  return true
}
