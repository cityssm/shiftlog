import type { Request, Response } from 'express'

import deleteEmployeeListMember from '../../database/employeeLists/deleteEmployeeListMember.js'
import getEmployeeList from '../../database/employeeLists/getEmployeeList.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteEmployeeListMemberResponse = {
  employeeList: Awaited<ReturnType<typeof getEmployeeList>>
  success: boolean
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      employeeListId: string
      employeeNumber: string
    }
  >,
  response: Response<DoDeleteEmployeeListMemberResponse>
): Promise<void> {
  const employeeListId = Number.parseInt(request.body.employeeListId, 10)

  const success = await deleteEmployeeListMember(
    employeeListId,
    request.body.employeeNumber
  )

  const employeeList = await getEmployeeList(employeeListId)

  response.json({
    employeeList,
    success
  } satisfies DoDeleteEmployeeListMemberResponse)
}
