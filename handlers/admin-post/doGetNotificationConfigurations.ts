import type { Request, Response } from 'express'

import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js'
import type { NotificationConfiguration } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetNotificationConfigurationsResponse = {
  success: true
  notificationConfigurations: NotificationConfiguration[]
}

export default async function handler(
  _request: Request,
  response: Response<DoGetNotificationConfigurationsResponse>
): Promise<void> {
  const notificationConfigurations = await getNotificationConfigurations()

  response.json({
    success: true,
    notificationConfigurations
  })
}
