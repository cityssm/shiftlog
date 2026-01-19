import publishToNtfy, {
  DEFAULT_NTFY_SERVER,
  ntfyMessagePriorityHigh
} from '@cityssm/ntfy-publish'

import getWorkOrder from '../../../database/workOrders/getWorkOrder.js'
import getWorkOrderMilestones from '../../../database/workOrders/getWorkOrderMilestones.js'
import { getWorkOrderUrl } from '../../../helpers/application.helpers.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'
import type {
  NotificationConfiguration,
  WorkOrder
} from '../../../types/record.types.js'
import type {
  NotificationFunction,
  NotificationFunctionResult,
  NtfyNotificationConfig
} from '../types.js'

const ntfyConnectorConfig = getConfigProperty('connectors.ntfy')

const ntfyServerUrl = ntfyConnectorConfig?.serverUrl ?? DEFAULT_NTFY_SERVER

async function getWorkOrderToSend(
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
      errorMessage: `Work order ID ${workOrderId} not found`
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

export const sendWorkOrderCreateNtfyNotification: NotificationFunction = async (
  notificationConfiguration: NotificationConfiguration,
  workOrderId: number | string
): Promise<NotificationFunctionResult | undefined> => {
  const workOrderToSend = await getWorkOrderToSend(
    workOrderId,
    notificationConfiguration
  )

  if (!workOrderToSend?.success) {
    return workOrderToSend
  }

  const workOrder = workOrderToSend.workOrder

  const ntfySpecificConfig = JSON.parse(
    notificationConfiguration.notificationTypeFormJson
  ) as NtfyNotificationConfig

  const success = await publishToNtfy({
    server: ntfyServerUrl,
    topic: ntfySpecificConfig.topic,

    title: getConfigProperty('application.applicationName'),

    message: `New ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`,

    clickURL: getWorkOrderUrl(workOrder.workOrderId),

    priority: ntfyMessagePriorityHigh,
    tags: ['star']
  })

  return success
    ? { success: true }
    : {
        success: false,
        errorMessage: 'Failed to send ntfy notification'
      }
}

export const sendWorkOrderUpdateNtfyNotification: NotificationFunction = async (
  notificationConfiguration: NotificationConfiguration,
  workOrderId: number | string
): Promise<NotificationFunctionResult | undefined> => {
  const workOrderToSend = await getWorkOrderToSend(
    workOrderId,
    notificationConfiguration
  )

  if (!workOrderToSend?.success) {
    return workOrderToSend
  }

  const workOrder = workOrderToSend.workOrder

  const ntfySpecificConfig = JSON.parse(
    notificationConfiguration.notificationTypeFormJson
  ) as NtfyNotificationConfig

  const success = await publishToNtfy({
    server: ntfyServerUrl,
    topic: ntfySpecificConfig.topic,

    title: getConfigProperty('application.applicationName'),

    message: `Updated ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`,

    clickURL: getWorkOrderUrl(workOrder.workOrderId),

    tags: ['pencil2']
  })

  return success
    ? { success: true }
    : {
        success: false,
        errorMessage: 'Failed to send ntfy notification'
      }
}
