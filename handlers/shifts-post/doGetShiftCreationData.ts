import type { Request, Response } from 'express'

import getEmployees from '../../database/employees/getEmployees.js'
import getShiftTimeDataListItems from '../../database/shifts/getShiftTimeDataListItems.js'
import getShiftTypeDataListItems from '../../database/shifts/getShiftTypeDataListItems.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftCreationDataResponse = {
  success: true

  shiftTimes: Array<{ dataListItem: string; dataListItemId: number }>
  shiftTypes: Array<{ dataListItem: string; dataListItemId: number }>

  supervisors: Array<{
    employeeNumber: string
    firstName: string
    lastName: string
  }>
}

export default async function handler(
  request: Request,
  response: Response<DoGetShiftCreationDataResponse>
): Promise<void> {
  let supervisors = await getEmployees({ isSupervisor: true })

  if (!(request.session.user?.userProperties.shifts.canManage ?? false)) {
    supervisors = supervisors.filter(
      (supervisor) => supervisor.userName === request.session.user?.userName
    )
  }

  const shiftTypes = await getShiftTypeDataListItems(request.session.user)
  const shiftTimes = await getShiftTimeDataListItems(request.session.user)

  response.json({
    success: true,
    shiftTypes,
    shiftTimes,
    supervisors
  })
}
