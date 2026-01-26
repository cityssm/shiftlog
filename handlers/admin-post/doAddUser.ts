import type { Request, Response } from 'express'

import addUser from '../../database/users/addUser.js'
import getUsers from '../../database/users/getUsers.js'
import type { DatabaseUser } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddUserResponse = {
  success: boolean
  users: DatabaseUser[]
}

export default async function handler(
  request: Request<unknown, unknown, { userName: string }>,
  response: Response<DoAddUserResponse>
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
