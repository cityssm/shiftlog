import type { Request, Response } from 'express'

import getEmployeeList from '../../database/employeeLists/getEmployeeList.js'

export default async function handler(
  request: Request<unknown, unknown, { employeeListId: string }>,
  response: Response
): Promise<void> {
  const employeeListId = Number.parseInt(
    request.body.employeeListId,
    10
  )

  const employeeList = await getEmployeeList(employeeListId)

  response.json({
    employeeList
  })
}
