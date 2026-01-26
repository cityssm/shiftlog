import type { Request, Response } from 'express'

import addUserGroup from '../../database/users/addUserGroup.js'
import getUserGroups from '../../database/users/getUserGroups.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddUserGroupResponse = {
  success: boolean
  userGroupId: number | undefined
  userGroups: Awaited<ReturnType<typeof getUserGroups>>
}

export default async function handler(
  request: Request<unknown, unknown, { userGroupName: string }>,
  response: Response<DoAddUserGroupResponse>
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
  } satisfies DoAddUserGroupResponse)
}
