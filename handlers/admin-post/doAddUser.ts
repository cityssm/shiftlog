import type { Request, Response } from 'express'

import addUser from '../../database/users/addUser.js'
import getUsers from '../../database/users/getUsers.js'

export default async function handler(
  request: Request<unknown, unknown, { userName: string }>,
  response: Response
): Promise<void> {
  const success = await addUser(
    request.body.userName,
    request.session.user as User
  )

  const users = await getUsers()

  response.json({
    success,

    users
  })
}
