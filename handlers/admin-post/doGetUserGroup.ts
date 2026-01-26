import type { Request, Response } from 'express'

import getUserGroup from '../../database/users/getUserGroup.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetUserGroupResponse = {
  userGroup: Awaited<ReturnType<typeof getUserGroup>>
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
