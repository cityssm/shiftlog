import type { Request, Response } from 'express'

import getEmployeeList, {
  type EmployeeListWithMembers
} from '../../database/employeeLists/getEmployeeList.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetEmployeeListResponse = {
  employeeList: EmployeeListWithMembers | undefined
}

export default async function handler(
  request: Request<unknown, unknown, { employeeListId: string }>,
  response: Response<DoGetEmployeeListResponse>
): Promise<void> {
  const employeeListId = Number.parseInt(request.body.employeeListId, 10)

  const employeeList = await getEmployeeList(employeeListId)

  response.json({
    employeeList
  } satisfies DoGetEmployeeListResponse)
}
