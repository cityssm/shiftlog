import type { Request, Response } from 'express'

import getEmployeeList from '../../database/employeeLists/getEmployeeList.js'
import updateEmployeeListMember from '../../database/employeeLists/updateEmployeeListMember.js'

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
  response: Response
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
