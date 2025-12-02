import type { Request, Response } from 'express'

import getUserGroup from '../../database/users/getUserGroup.js'

export default async function handler(
  request: Request<unknown, unknown, { userGroupId: string }>,
  response: Response
): Promise<void> {
  const userGroupId = Number.parseInt(request.body.userGroupId, 10)

  const userGroup = await getUserGroup(userGroupId)

  response.json({
    userGroup
  })
}
