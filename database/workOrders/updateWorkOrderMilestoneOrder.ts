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
    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('workOrderMilestoneId', milestoneOrder.workOrderMilestoneId)
      .input('orderNumber', milestoneOrder.orderNumber)
      .input('userName', userName).query(/* sql */ `
        update ShiftLog.WorkOrderMilestones
        set
          orderNumber = @orderNumber,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
        where workOrderMilestoneId = @workOrderMilestoneId
          and recordDelete_dateTime is null
          and workOrderId in (
            select workOrderId
            from ShiftLog.WorkOrders
            where recordDelete_dateTime is null
              and instance = @instance
          )
      `)
  }

  return true
}
