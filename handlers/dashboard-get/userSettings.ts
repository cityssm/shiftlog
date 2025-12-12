import type { Request, Response } from 'express'

import getEmployee from '../../database/employees/getEmployee.js'

import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js'

export default async function handler(request: Request, response: Response): Promise<void> {
  const assignedToDataListItems = await getAssignedToDataListItems(request.session.user)

  // Get employee information if available and userName matches
  let employee = request.session.user?.employeeNumber
    ? await getEmployee(request.session.user.employeeNumber)
    : undefined

  // Verify that the employee's userName matches the current user's userName
  if (employee !== undefined && employee.userName !== request.session.user?.userName) {
    employee = undefined
  }

  response.render('dashboard/userSettings', {
    headTitle: 'User Settings',

    assignedToDataListItems,
    employee
  })
}
