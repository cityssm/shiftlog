import type { Request, Response } from 'express'

import addUserGroupMember from '../../database/users/addUserGroupMember.js'
import getUserGroup from '../../database/users/getUserGroup.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddUserGroupMemberResponse = {
  success: boolean
  userGroup: Awaited<ReturnType<typeof getUserGroup>>
}

export default async function handler(
  request: Request<unknown, unknown, { userGroupId: string; userName: string }>,
  response: Response<DoAddUserGroupMemberResponse>
): Promise<void> {
  const userGroupId = Number.parseInt(request.body.userGroupId, 10)
  
  const success = await addUserGroupMember(
    userGroupId,
    request.body.userName
  )

  const userGroup = await getUserGroup(userGroupId)

  response.json({
    success,
    userGroup
  } satisfies DoAddUserGroupMemberResponse)
}
