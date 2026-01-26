import type { Request, Response } from 'express'

import deleteEmployee from '../../database/employees/deleteEmployee.js'
import getEmployees from '../../database/employees/getEmployees.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteEmployeeResponse =
  | {
      employees: Awaited<ReturnType<typeof getEmployees>>
      message: string
      success: true
    }
  | {
      message: string
      success: false
    }

export default async function handler(
  request: Request<unknown, unknown, { employeeNumber: string }>,
  response: Response<DoDeleteEmployeeResponse>
): Promise<void> {
  try {
    const success = await deleteEmployee(
      request.body.employeeNumber,
      request.session.user as User
    )

    if (success) {
      const employees = await getEmployees()

      response.json({
        employees,
        message: 'Employee deleted successfully',
        success: true
      } satisfies DoDeleteEmployeeResponse)
    } else {
      response.status(404).json({
        message: 'Employee not found or already deleted',
        success: false
      } satisfies DoDeleteEmployeeResponse)
    }
  } catch (error) {
    response.status(500).json({
      message:
        error instanceof Error ? error.message : 'Failed to delete employee',
      success: false
    } satisfies DoDeleteEmployeeResponse)
  }
}
