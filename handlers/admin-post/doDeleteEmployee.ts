import type { Request, Response } from 'express'

import deleteEmployee from '../../database/employees/deleteEmployee.js'
import getEmployees from '../../database/employees/getEmployees.js'

export default async function handler(
  request: Request<unknown, unknown, { employeeNumber: string }>,
  response: Response
): Promise<void> {
  try {
    const success = await deleteEmployee(
      request.body.employeeNumber,
      request.session.user as User
    )

    if (success) {
      const employees = await getEmployees()

      response.json({
        message: 'Employee deleted successfully',
        success: true,
        employees
      })
    } else {
      response.status(404).json({
        message: 'Employee not found or already deleted',
        success: false
      })
    }
  } catch (error) {
    response.status(500).json({
      message:
        error instanceof Error ? error.message : 'Failed to delete employee',
      success: false
    })
  }
}
