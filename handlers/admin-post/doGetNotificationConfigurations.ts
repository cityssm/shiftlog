import type { Request, Response } from 'express'

import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const notificationConfigurations = await getNotificationConfigurations()

  response.json({
    success: true,
    notificationConfigurations
  })
}
