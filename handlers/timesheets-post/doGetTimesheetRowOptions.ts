import type { Request, Response } from 'express'

import getDataListItems from '../../database/app/getDataListItems.js'
import getEmployees from '../../database/employees/getEmployees.js'
import getEquipmentList from '../../database/equipment/getEquipmentList.js'

export interface DoGetTimesheetRowOptionsResponse {
  success: boolean
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
  const [employees, equipment, jobClassifications, timeCodes] = await Promise.all([
    getEmployees(),
    getEquipmentList(),
    getDataListItems('jobClassifications', request.session.user?.userName),
    getDataListItems('timeCodes', request.session.user?.userName)
  ])

  response.json({
    success: true,
    employees: employees.map((e) => ({
      employeeNumber: e.employeeNumber,
      firstName: e.firstName,
      lastName: e.lastName
    })),
    equipment: equipment.map((e) => ({
      equipmentNumber: e.equipmentNumber,
      equipmentName: e.equipmentName
    })),
    jobClassifications: jobClassifications.map((j) => ({
      dataListItemId: j.dataListItemId,
      dataListItem: j.dataListItem
    })),
    timeCodes: timeCodes.map((t) => ({
      dataListItemId: t.dataListItemId,
      dataListItem: t.dataListItem
    }))
  })
}
