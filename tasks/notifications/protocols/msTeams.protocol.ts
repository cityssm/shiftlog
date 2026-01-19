import type { NotificationConfiguration } from '../../../types/record.types.js'
import type {
  NotificationFunction,
  NotificationFunctionResult
} from '../types.js'

export const sendWorkOrderCreateMsTeamsNotification: NotificationFunction =
  async (
    notificationConfiguration: NotificationConfiguration,
    workOrderId: number | string
  ): Promise<NotificationFunctionResult | undefined> => {
    throw new Error('Not implemented yet')
  }

export const sendWorkOrderUpdateMsTeamsNotification: NotificationFunction =
  async (
    notificationConfiguration: NotificationConfiguration,
    workOrderId: number | string
  ): Promise<NotificationFunctionResult | undefined> => {
    throw new Error('Not implemented yet')
  }
