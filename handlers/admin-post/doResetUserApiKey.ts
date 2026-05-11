import type { Request, Response } from 'express'

import getUsers from '../../database/users/getUsers.js'
import getUserSettings from '../../database/users/getUserSettings.js'
import { updateApiKeyUserSetting } from '../../database/users/updateUserSetting.js'
import type { DatabaseUser } from '../../types/record.types.js'

export type DoResetUserApiKeyResponse =
  | {
      success: false

      message: string
    }
  | {
      success: true

      apiKey: string
      message: string
      users: DatabaseUser[]
    }

export default async function handler(
  request: Request<unknown, unknown, { userName?: string }>,
  response: Response<DoResetUserApiKeyResponse>
): Promise<void> {
  if ((request.body.userName ?? '').trim() === '') {
    response.status(400).json({
      message: 'User name is required',
      success: false
    })

    return
  }

  try {
    // Generate and update the API key
    const newApiKey = await updateApiKeyUserSetting(request.body.userName ?? '')

    // If the reset user is the current user in the session, update the session
    if (request.session.user?.userName === request.body.userName) {
      ;(request.session.user as User).userSettings = await getUserSettings(
        request.body.userName ?? ''
      )
    }

    // Get the updated users list to return
    const users = await getUsers()

    response.json({
      success: true,

      apiKey: newApiKey,
      message: 'API key reset successfully',
      users
    })
  } catch {
    response.status(500).json({
      success: false,

      message: 'Failed to reset API key'
    })
  }
}
