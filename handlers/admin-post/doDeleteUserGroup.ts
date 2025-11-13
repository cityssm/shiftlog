import type { Request, Response } from 'express'

import deleteUserGroup from '../../database/userGroups/deleteUserGroup.js'
import getUserGroups from '../../database/userGroups/getUserGroups.js'

export default async function handler(
  request: Request<unknown, unknown, { userGroupId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteUserGroup(
    Number.parseInt(request.body.userGroupId, 10),
    request.session.user as User
  )

  const userGroups = await getUserGroups()

  response.json({
    success,
    userGroups
  })
}
