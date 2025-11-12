import type { Request, Response } from 'express'

import getUserSettings from '../../database/users/getUserSettings.js'
import { updateApiKeyUserSetting } from '../../database/users/updateUserSetting.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const apiKey = await updateApiKeyUserSetting(
    request.session.user?.userName ?? ''
  )

  ;(request.session.user as User).userSettings = await getUserSettings(
    request.session.user?.userName ?? ''
  )

  response.json({
    success: true,

    apiKey
  })
}
