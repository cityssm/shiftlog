import type { Request, Response } from 'express'

import updateEmployeeContactByUserName, {
  type EmployeeContactFields
} from '../../database/employees/updateEmployeeContactByUserName.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateEmployeeContactResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, EmployeeContactFields>,
  response: Response<DoUpdateEmployeeContactResponse>
): Promise<void> {
  const userName = request.session.user?.userName ?? ''

  const success = await updateEmployeeContactByUserName(
    userName,
    {
      phoneNumber: request.body.phoneNumber,
      phoneNumberAlternate: request.body.phoneNumberAlternate,
      emailAddress: request.body.emailAddress
    },
    request.session.user as User
  )

  response.json({
    success
  } satisfies DoUpdateEmployeeContactResponse)
}
