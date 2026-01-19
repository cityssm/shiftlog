import type { NotificationConfiguration } from '../../../types/record.types.js'
import type {
  NotificationFunction,
  NotificationFunctionResult
} from '../types.js'

export const sendWorkOrderCreateEmailNotification: NotificationFunction =
  async (
    notificationConfiguration: NotificationConfiguration,
    workOrderId: number | string
  ): Promise<NotificationFunctionResult | undefined> => {
    throw new Error('Not implemented yet')
  }

export const sendWorkOrderUpdateEmailNotification: NotificationFunction =
  async (
    notificationConfiguration: NotificationConfiguration,
    workOrderId: number | string
  ): Promise<NotificationFunctionResult | undefined> => {
    throw new Error('Not implemented yet')
  }
