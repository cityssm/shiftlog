import type { Request, Response } from 'express'

import getUserGroups from '../../database/userGroups/getUserGroups.js'
import updateUserGroup from '../../database/userGroups/updateUserGroup.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { userGroupId: string; userGroupName: string }
  >,
  response: Response
): Promise<void> {
  const success = await updateUserGroup(
    Number.parseInt(request.body.userGroupId, 10),
    request.body.userGroupName,
    request.session.user as User
  )

  const userGroups = await getUserGroups()

  response.json({
    success,
    userGroups
  })
}
