import type { Request, Response } from 'express'

import getEmployeeList, {
  type EmployeeListWithMembers
} from '../../database/employeeLists/getEmployeeList.js'
import updateEmployeeListMember from '../../database/employeeLists/updateEmployeeListMember.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateEmployeeListMemberResponse = {
  employeeList: EmployeeListWithMembers | undefined
  success: boolean
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      employeeListId: string
      employeeNumber: string
      seniorityDate: string
      seniorityOrderNumber: string
    }
  >,
  response: Response<DoUpdateEmployeeListMemberResponse>
): Promise<void> {
  const employeeListId = Number.parseInt(request.body.employeeListId, 10)

  const success = await updateEmployeeListMember(
    employeeListId,
    request.body.employeeNumber,
    request.body.seniorityDate === '' ? undefined : request.body.seniorityDate,
    Number.parseInt(request.body.seniorityOrderNumber, 10)
  )

  const employeeList = await getEmployeeList(employeeListId)

  response.json({
    employeeList,
    success
  })
}
