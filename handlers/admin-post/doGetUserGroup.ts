import type { Request, Response } from 'express'

import getUserGroup from '../../database/users/getUserGroup.js'
import type { UserGroup } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetUserGroupResponse = {
  userGroup: UserGroup | undefined
}

export default async function handler(
  request: Request<unknown, unknown, { userGroupId: string }>,
  response: Response<DoGetUserGroupResponse>
): Promise<void> {
  const userGroupId = Number.parseInt(request.body.userGroupId, 10)

  const userGroup = await getUserGroup(userGroupId)

  response.json({
    userGroup
  } satisfies DoGetUserGroupResponse)
}
