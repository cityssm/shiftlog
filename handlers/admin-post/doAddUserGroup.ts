import type { Request, Response } from 'express'

import addUserGroup from '../../database/users/addUserGroup.js'
import getUserGroups from '../../database/users/getUserGroups.js'

export default async function handler(
  request: Request<unknown, unknown, { userGroupName: string }>,
  response: Response
): Promise<void> {
  const userGroupId = await addUserGroup(
    request.body.userGroupName,
    request.session.user as User
  )

  const userGroups = await getUserGroups()

  response.json({
    success: userGroupId !== undefined,
    userGroupId,
    userGroups
  })
}
