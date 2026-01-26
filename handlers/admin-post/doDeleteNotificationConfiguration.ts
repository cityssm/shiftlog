import type { Request, Response } from 'express'

import deleteNotificationConfiguration from '../../database/notifications/deleteNotificationConfiguration.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteNotificationConfigurationResponse =
  | {
      success: boolean
    }
  | {
      success: false
      errorMessage: string
    }

export default async function handler(
  request: Request,
  response: Response<DoDeleteNotificationConfigurationResponse>
): Promise<void> {
  try {
    const success = await deleteNotificationConfiguration(
      Number.parseInt(request.body.notificationConfigurationId, 10),
      request.session.user?.userName ?? ''
    )

    response.json({
      success
    } satisfies DoDeleteNotificationConfigurationResponse)
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    } satisfies DoDeleteNotificationConfigurationResponse)
  }
}
