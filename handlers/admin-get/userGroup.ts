import type { Request, Response } from 'express'

import getUserGroup from '../../database/users/getUserGroup.js'

export default async function handler(
  request: Request<{ userGroupId: string }>,
  response: Response
): Promise<void> {
  const userGroupId = Number.parseInt(request.params.userGroupId, 10)
  const userGroup = await getUserGroup(userGroupId)

  response.json({
    userGroup
  })
}
