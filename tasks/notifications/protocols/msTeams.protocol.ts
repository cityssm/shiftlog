import sendMessageToTeamsWebhook from '@cityssm/ms-teams-workflow-webhook'
import { recordToFactSet } from '@cityssm/ms-teams-workflow-webhook/helpers'

import { getWorkOrderUrl } from '../../../helpers/application.helpers.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'
import type { NotificationConfiguration } from '../../../types/record.types.js'
import { getWorkOrderToSend } from '../helpers/workOrder.helpers.js'
import type {
  MsTeamsNotificationConfig,
  NotificationFunction,
  NotificationFunctionResult
} from '../types.js'

export const sendWorkOrderCreateMsTeamsNotification: NotificationFunction =
  async (
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

    const msTeamsSpecificConfig = JSON.parse(
      notificationConfiguration.notificationTypeFormJson
    ) as MsTeamsNotificationConfig

    await sendMessageToTeamsWebhook(
      msTeamsSpecificConfig.webhookUrl,
      [
        {
          type: 'TextBlock',

          text: `New ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`,
          weight: 'bolder'
        },
        recordToFactSet({
          Priority: workOrder.workOrderPriorityDataListItem,
          Status: workOrder.workOrderStatusDataListItem,
          Details: workOrder.workOrderDetails
        })
      ],
      {
        type: 'Action.OpenUrl',

        title: `View ${getConfigProperty('workOrders.sectionNameSingular')}`,
        url: getWorkOrderUrl(workOrder.workOrderId)
      }
    )

    return { success: true }
  }

export const sendWorkOrderUpdateMsTeamsNotification: NotificationFunction =
  async (
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

    const msTeamsSpecificConfig = JSON.parse(
      notificationConfiguration.notificationTypeFormJson
    ) as MsTeamsNotificationConfig

    await sendMessageToTeamsWebhook(
      msTeamsSpecificConfig.webhookUrl,
      [
        {
          type: 'TextBlock',

          text: `Updated ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`,
          weight: 'bolder'
        },
        recordToFactSet({
          Priority: workOrder.workOrderPriorityDataListItem,
          Status: workOrder.workOrderStatusDataListItem,
          Details: workOrder.workOrderDetails
        })
      ],
      {
        type: 'Action.OpenUrl',

        title: `View ${getConfigProperty('workOrders.sectionNameSingular')}`,
        url: getWorkOrderUrl(workOrder.workOrderId)
      }
    )

    return { success: true }
  }
