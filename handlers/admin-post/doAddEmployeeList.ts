import type { Request, Response } from 'express'

import addEmployeeList from '../../database/employeeLists/addEmployeeList.js'
import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js'
import type { EmployeeList } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddEmployeeListResponse = {
  employeeListId: number | undefined
  employeeLists: EmployeeList[]
  success: boolean
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      employeeListName: string
      userGroupId: string
    }
  >,
  response: Response<DoAddEmployeeListResponse>
): Promise<void> {
  const employeeListId = await addEmployeeList(
    {
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
    employeeListId,
    employeeLists,
    success: employeeListId !== undefined
  })
}
