import type { Request, Response } from 'express'

import updateEmployeeContactByUserName, {
  type EmployeeContactFields
} from '../../database/employees/updateEmployeeContactByUserName.js'

export default async function handler(
  request: Request<unknown, unknown, EmployeeContactFields>,
  response: Response
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
  })
}
