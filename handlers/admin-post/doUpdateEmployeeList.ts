import type { Request, Response } from 'express'

import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js'
import updateEmployeeList from '../../database/employeeLists/updateEmployeeList.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      employeeListId: string
      employeeListName: string
      userGroupId: string
    }
  >,
  response: Response
): Promise<void> {
  const success = await updateEmployeeList(
    {
      employeeListId: Number.parseInt(request.body.employeeListId, 10),
      employeeListName: request.body.employeeListName,
      userGroupId:
        request.body.userGroupId === ''
          ? undefined
          : Number.parseInt(request.body.userGroupId, 10)
    },
    request.session.user as User
  )

  const employeeLists = await getEmployeeLists()

  response.json({
    employeeLists,
    success
  })
}
