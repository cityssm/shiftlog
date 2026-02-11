import type { Request, Response } from 'express'

import addEmployee from '../../database/employees/addEmployee.js'
import getEmployees from '../../database/employees/getEmployees.js'
import type { Employee } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddEmployeeResponse = {
  success: boolean

  employees: Employee[]
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
  })
}
