import type { Request, Response } from 'express'

import getUsers from '../../database/users/getUsers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { userSettingKeys } from '../../types/user.types.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const users = await getUsers()

  response.render('admin/users', {
    headTitle: 'User Management',
    users,

    domain: getConfigProperty('login.domain'),

    userSettingKeys
  })
}
