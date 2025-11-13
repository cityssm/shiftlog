import type { Request, Response } from 'express'

import addEmployee from '../../database/employees/addEmployee.js'
import getEmployees from '../../database/employees/getEmployees.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { employeeNumber: string; firstName: string; lastName: string }
  >,
  response: Response
): Promise<void> {
  const success = await addEmployee(
    request.body.employeeNumber,
    request.body.firstName,
    request.body.lastName,
    request.session.user as User
  )

  const employees = await getEmployees()

  response.json({
    employees,
    success
  })
}
