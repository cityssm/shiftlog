import type { Request, Response } from 'express'

import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetNotificationConfigurationsResponse = {
  success: true
  notificationConfigurations: Awaited<
    ReturnType<typeof getNotificationConfigurations>
  >
}

export default async function handler(
  _request: Request,
  response: Response<DoGetNotificationConfigurationsResponse>
): Promise<void> {
  const notificationConfigurations = await getNotificationConfigurations()

  response.json({
    success: true,
    notificationConfigurations
  } satisfies DoGetNotificationConfigurationsResponse)
}
