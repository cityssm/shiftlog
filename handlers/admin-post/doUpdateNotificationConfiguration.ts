import type { Request, Response } from 'express'

import updateNotificationConfiguration from '../../database/notifications/updateNotificationConfiguration.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateNotificationConfigurationResponse =
  | {
      success: boolean
    }
  | {
      success: false
      errorMessage: string
    }

export default async function handler(
  request: Request,
  response: Response<DoUpdateNotificationConfigurationResponse>
): Promise<void> {
  try {
    const success = await updateNotificationConfiguration(
      request.body,
      request.session.user?.userName ?? ''
    )

    response.json({
      success
    } satisfies DoUpdateNotificationConfigurationResponse)
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    } satisfies DoUpdateNotificationConfigurationResponse)
  }
}
