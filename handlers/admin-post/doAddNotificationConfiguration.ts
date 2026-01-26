import type { Request, Response } from 'express'

import createNotificationConfiguration from '../../database/notifications/createNotificationConfiguration.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddNotificationConfigurationResponse =
  | {
      success: true
      notificationConfigurationId: number
    }
  | {
      success: false
      errorMessage: string
    }

export default async function handler(
  request: Request,
  response: Response<DoAddNotificationConfigurationResponse>
): Promise<void> {
  try {
    const notificationConfigurationId = await createNotificationConfiguration(
      request.body,
      request.session.user?.userName ?? ''
    )

    response.json({
      success: true,
      notificationConfigurationId
    } satisfies DoAddNotificationConfigurationResponse)
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    } satisfies DoAddNotificationConfigurationResponse)
  }
}
