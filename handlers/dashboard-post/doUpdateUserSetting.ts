// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

import type { Request, Response } from 'express'

import getUserSettings from '../../database/users/getUserSettings.js'
import updateUserSetting from '../../database/users/updateUserSetting.js'
import type { UserSettingKey } from '../../types/user.types.js'

const updatableUserSettingKeys = new Set<UserSettingKey>([
  'workOrders.defaultAssignedToDataListItemId'
])

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { settingKey: string; settingValue: string }
  >,
  response: Response
): Promise<void> {
  const success = updatableUserSettingKeys.has(
    request.body.settingKey as UserSettingKey
  )
    ? await updateUserSetting(
        request.session.user?.userName ?? '',
        request.body.settingKey as UserSettingKey,
        request.body.settingValue
      )
    : false

  ;(request.session.user as User).userSettings = await getUserSettings(
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
