import type { Request, Response } from 'express'

import getUserGroups from '../../database/users/getUserGroups.js'
import updateUserGroup from '../../database/users/updateUserGroup.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateUserGroupResponse = {
  success: boolean
  userGroups: Awaited<ReturnType<typeof getUserGroups>>
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { userGroupId: string; userGroupName: string }
  >,
  response: Response<DoUpdateUserGroupResponse>
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
  } satisfies DoUpdateUserGroupResponse)
}
