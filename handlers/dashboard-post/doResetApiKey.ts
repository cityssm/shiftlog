import type { Request, Response } from 'express'

import getUserSettings from '../../database/users/getUserSettings.js'
import { updateApiKeyUserSetting } from '../../database/users/updateUserSetting.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoResetApiKeyResponse = {
  success: boolean
  apiKey: string
}

export default async function handler(
  request: Request,
  response: Response<DoResetApiKeyResponse>
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
  } satisfies DoResetApiKeyResponse)
}
