import type { Request, Response } from 'express'

import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js'
import getEmployees from '../../database/employees/getEmployees.js'
import getUserGroups from '../../database/users/getUserGroups.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const employeeLists = await getEmployeeLists()
  const employees = await getEmployees()
  const userGroups = await getUserGroups()

  response.render('admin/employeeLists', {
    employeeLists,
    employees,
    headTitle: 'Employee List Management',
    userGroups
  })
}
