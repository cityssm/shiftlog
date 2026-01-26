import type { Request, Response } from 'express'

import deleteUserGroup from '../../database/users/deleteUserGroup.js'
import getUserGroups from '../../database/users/getUserGroups.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteUserGroupResponse = {
  success: boolean
  userGroups: Awaited<ReturnType<typeof getUserGroups>>
}

export default async function handler(
  request: Request<unknown, unknown, { userGroupId: string }>,
  response: Response<DoDeleteUserGroupResponse>
): Promise<void> {
  const success = await deleteUserGroup(
    Number.parseInt(request.body.userGroupId, 10),
    request.session.user as User
  )

  const userGroups = await getUserGroups()

  response.json({
    success,
    userGroups
  } satisfies DoDeleteUserGroupResponse)
}
