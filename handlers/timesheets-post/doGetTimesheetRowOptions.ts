import type { Request, Response } from 'express'

import getDataListItems from '../../database/app/getDataListItems.js'
import getEmployees from '../../database/employees/getEmployees.js'
import getEquipmentList from '../../database/equipment/getEquipmentList.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetTimesheetRowOptionsResponse = {
  success: true

  employees: Array<{
    employeeNumber: string
    firstName: string
    lastName: string
  }>
  equipment: Array<{
    equipmentNumber: string
    equipmentName: string
  }>
  jobClassifications: Array<{
    dataListItemId: number
    dataListItem: string
  }>
  timeCodes: Array<{
    dataListItemId: number
    dataListItem: string
  }>
}

export default async function handler(
  request: Request,
  response: Response<DoGetTimesheetRowOptionsResponse>
): Promise<void> {
  const [employees, equipment, jobClassifications, timeCodes] =
    await Promise.all([
      getEmployees(),
      getEquipmentList(),
      getDataListItems('jobClassifications', request.session.user?.userName),
      getDataListItems('timeCodes', request.session.user?.userName)
    ])

  response.json({
    success: true,

    employees: employees.map((employeeItem) => ({
      employeeNumber: employeeItem.employeeNumber,
      firstName: employeeItem.firstName,
      lastName: employeeItem.lastName
    })),
    equipment: equipment.map((equipmentItem) => ({
      equipmentNumber: equipmentItem.equipmentNumber,
      equipmentName: equipmentItem.equipmentName
    })),
    jobClassifications: jobClassifications.map((jobClassificationItem) => ({
      dataListItemId: jobClassificationItem.dataListItemId,
      dataListItem: jobClassificationItem.dataListItem
    })),
    timeCodes: timeCodes.map((timeCodeItem) => ({
      dataListItemId: timeCodeItem.dataListItemId,
      dataListItem: timeCodeItem.dataListItem
    }))
  })
}
