import type { Request, Response } from 'express'

import getEmployeeLists from '../../database/employeeLists/getEmployeeLists.js'
import updateEmployeeList from '../../database/employeeLists/updateEmployeeList.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateEmployeeListResponse = {
  employeeLists: Awaited<ReturnType<typeof getEmployeeLists>>
  success: boolean
}

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
  response: Response<DoUpdateEmployeeListResponse>
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
  } satisfies DoUpdateEmployeeListResponse)
}
