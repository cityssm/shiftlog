import type { Request, Response } from 'express'

import deleteUserGroupMember from '../../database/users/deleteUserGroupMember.js'
import getUserGroup from '../../database/users/getUserGroup.js'

export default async function handler(
  request: Request<unknown, unknown, { userGroupId: string; userName: string }>,
  response: Response
): Promise<void> {
  const userGroupId = Number.parseInt(request.body.userGroupId, 10)
  
  const success = await deleteUserGroupMember(
    userGroupId,
    request.body.userName
  )

  const userGroup = await getUserGroup(userGroupId)

  response.json({
    success,
    userGroup
  })
}
