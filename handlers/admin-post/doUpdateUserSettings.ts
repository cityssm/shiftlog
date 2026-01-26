import type { Request, Response } from 'express'

import getUsers from '../../database/users/getUsers.js'
import getUserSettings from '../../database/users/getUserSettings.js'
import updateUserSetting from '../../database/users/updateUserSetting.js'
import type { DatabaseUser } from '../../types/record.types.js'
import { userSettingKeys } from '../../types/user.types.js'

export type DoUpdateUserSettingsResponse =
  | {
      message: string
      success: false
    }
  | {
      message: string
      success: true
      users: DatabaseUser[]
    }

export default async function handler(
  request: Request<unknown, unknown, { userName: string }>,
  response: Response<DoUpdateUserSettingsResponse>
): Promise<void> {
  if (request.body.userName === '') {
    response.status(400).json({
      message: 'User name is required',
      success: false
    })

    return
  }

  // Update each user setting
  for (const settingKey of userSettingKeys) {
    // Skip apiKey as it cannot be updated directly by admins
    if (settingKey === 'apiKey') {
      continue
    }

    const settingValue = request.body[settingKey] as string | undefined

    if (settingValue !== undefined) {
      // eslint-disable-next-line no-await-in-loop
      await updateUserSetting(request.body.userName, settingKey, settingValue)
    }
  }

  // If the updated user is the current user, update their session
  if (request.session.user?.userName === request.body.userName) {
    ;(request.session.user as User).userSettings = await getUserSettings(
      request.body.userName
    )
  }

  // Get the updated users list to return
  const users = await getUsers()

  response.json({
    message: 'User settings updated successfully',
    success: true,
    users
  })
}
