import type { Request, Response } from 'express'

import getEmployeeList, {
  type EmployeeListWithMembers
} from '../../database/employeeLists/getEmployeeList.js'
import reorderEmployeeListMembers, {
  type ReorderEmployeeListMembersForm
} from '../../database/employeeLists/reorderEmployeeListMembers.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoReorderEmployeeListMembersResponse = {
  employeeList: EmployeeListWithMembers | undefined
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, ReorderEmployeeListMembersForm>,
  response: Response<DoReorderEmployeeListMembersResponse>
): Promise<void> {
  const success = await reorderEmployeeListMembers(request.body)

  let employeeList: EmployeeListWithMembers | undefined

  if (success) {
    employeeList = await getEmployeeList(request.body.employeeListId)
  }

  response.json({
    employeeList,
    success
  })
}
