import type { Request, Response } from 'express'

import createNotificationConfiguration from '../../database/notifications/createNotificationConfiguration.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const notificationConfigurationId = await createNotificationConfiguration(
      request.body,
      request.session.user?.userName ?? ''
    )

    response.json({
      success: true,
      notificationConfigurationId
    })
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    })
  }
}
