import type { Request, Response } from 'express'

import addUserGroup from '../../database/users/addUserGroup.js'
import getUserGroups from '../../database/users/getUserGroups.js'
import type { UserGroup } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddUserGroupResponse = {
  success: boolean
  userGroupId: number | undefined
  userGroups: UserGroup[]
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
  })
}
