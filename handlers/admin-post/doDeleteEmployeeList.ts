import type { Request, Response } from 'express'

import deleteEmployeeList from '../../database/employeeLists/deleteEmployeeList.js'
import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js'
import type { EmployeeList } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteEmployeeListResponse = {
  employeeLists: EmployeeList[]
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { employeeListId: string }>,
  response: Response<DoDeleteEmployeeListResponse>
): Promise<void> {
  const success = await deleteEmployeeList(
    Number.parseInt(request.body.employeeListId, 10),
    request.session.user as User
  )

  const employeeLists = await getEmployeeLists()

  response.json({
    employeeLists,
    success
  })
}
