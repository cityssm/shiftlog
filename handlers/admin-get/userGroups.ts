import type { Request, Response } from 'express'

import getUserGroups from '../../database/userGroups/getUserGroups.js'
import getUsers from '../../database/users/getUsers.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const userGroups = await getUserGroups()
  const users = await getUsers()

  response.render('admin/userGroups', {
    headTitle: 'User Group Management',
    userGroups,
    users
  })
}
