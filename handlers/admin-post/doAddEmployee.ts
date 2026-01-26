import type { Request, Response } from 'express'

import addEmployee from '../../database/employees/addEmployee.js'
import getEmployees from '../../database/employees/getEmployees.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddEmployeeResponse = {
  employees: Awaited<ReturnType<typeof getEmployees>>
  success: boolean
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { employeeNumber: string; firstName: string; lastName: string }
  >,
  response: Response<DoAddEmployeeResponse>
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
  } satisfies DoAddEmployeeResponse)
}
