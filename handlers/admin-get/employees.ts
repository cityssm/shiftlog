import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getUserGroups from '../../database/users/getUserGroups.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const employees = await getEmployees()
  const userGroups = await getUserGroups()

  response.render('admin/employees', {
    headTitle: 'Employee Management',
    employees,
    userGroups
  })
}
