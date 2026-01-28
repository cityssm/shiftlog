import getWorkOrder from '../../../database/workOrders/getWorkOrder.js'
import getWorkOrderMilestones from '../../../database/workOrders/getWorkOrderMilestones.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import type {
  NotificationConfiguration,
  WorkOrder
} from '../../../types/record.types.js'

export async function getWorkOrderToSend(
  workOrderId: number | string,
  notificationConfiguration: NotificationConfiguration
): Promise<
  | { success: false; errorMessage: string }
  | { success: true; workOrder: WorkOrder }
  | undefined
> {
  const workOrder = await getWorkOrder(workOrderId)

  if (workOrder === undefined) {
    return {
      success: false,
      errorMessage: `${getConfigProperty('workOrders.sectionNameSingular')} ID ${workOrderId} not found`
    }
  }

  let sendMessage =
    notificationConfiguration.assignedToId === null ||
    notificationConfiguration.assignedToId === undefined ||
    notificationConfiguration.assignedToId === workOrder.assignedToId

  if (!sendMessage && notificationConfiguration.assignedToId !== null) {
    const workOrderMilestones = await getWorkOrderMilestones(workOrderId)

    sendMessage = workOrderMilestones.some(
      (milestone) =>
        milestone.assignedToId === notificationConfiguration.assignedToId
    )
  }

  if (!sendMessage) {
    return undefined
  }

  return { success: true, workOrder }
}
