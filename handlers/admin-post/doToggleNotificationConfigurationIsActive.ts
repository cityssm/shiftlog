import type { Request, Response } from 'express'

import toggleNotificationConfigurationIsActive from '../../database/notifications/toggleNotificationConfigurationIsActive.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoToggleNotificationConfigurationIsActiveResponse = {
  success: boolean
  errorMessage?: string
}

export default async function handler(
  request: Request,
  response: Response<DoToggleNotificationConfigurationIsActiveResponse>
): Promise<void> {
  try {
    const success = await toggleNotificationConfigurationIsActive(
      Number.parseInt(request.body.notificationConfigurationId, 10),
      request.session.user?.userName ?? ''
    )

    response.json({
      success
    })
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    })
  }
}
