import type { Request, Response } from 'express'

import deleteUser from '../../database/users/deleteUser.js'
import getUsers from '../../database/users/getUsers.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteUserResponse =
  | {
      message: string
      success: true
      users: Awaited<ReturnType<typeof getUsers>>
    }
  | {
      message: string
      success: false
    }

export default async function handler(
  request: Request<unknown, unknown, { userName?: string }>,
  response: Response<DoDeleteUserResponse>
): Promise<void> {
  let userName = request.body.userName ?? ''

  if (typeof userName === 'string') {
    userName = userName.trim()
  }

  if (typeof userName !== 'string' || userName === '') {
    response.status(400).json({
      message: 'User name is required',
      success: false
    } satisfies DoDeleteUserResponse)
    return
  }

  const success = await deleteUser(userName, request.session.user as User)

  if (success) {
    const users = await getUsers()

    response.json({
      message: 'User deleted successfully',
      success: true,
      users
    } satisfies DoDeleteUserResponse)
  } else {
    response.status(404).json({
      message: 'User not found',
      success: false
    } satisfies DoDeleteUserResponse)
  }
}
