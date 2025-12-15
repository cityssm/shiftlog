import type { Request, Response } from 'express'

import getEmployeeList from '../../database/employeeLists/getEmployeeList.js'
import reorderEmployeeListMembers, {
  type ReorderEmployeeListMembersForm
} from '../../database/employeeLists/reorderEmployeeListMembers.js'

export default async function handler(
  request: Request<unknown, unknown, ReorderEmployeeListMembersForm>,
  response: Response
): Promise<void> {
  const success = await reorderEmployeeListMembers(request.body)

  let employeeList:
    | Awaited<ReturnType<typeof getEmployeeList>>
    | undefined

  if (success) {
    employeeList = await getEmployeeList(request.body.employeeListId)
  }

  response.json({
    employeeList,
    success
  })
}
