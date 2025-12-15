import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import { getAvailableCrews } from '../../database/shifts/getAvailableCrews.js'
import type { AvailableCrew } from '../../database/shifts/getAvailableCrews.js'
import { getAvailableEmployees } from '../../database/shifts/getAvailableEmployees.js'
import type { AvailableEmployee } from '../../database/shifts/getAvailableEmployees.js'
import { getAvailableEquipment } from '../../database/shifts/getAvailableEquipment.js'
import type { AvailableEquipment } from '../../database/shifts/getAvailableEquipment.js'

export interface DoGetAvailableResourcesResponse {
  crews: AvailableCrew[]
  employees: AvailableEmployee[]
  equipment: AvailableEquipment[]
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { shiftDateString: DateString }>,
  response: Response<DoGetAvailableResourcesResponse>
): Promise<void> {
  const { shiftDateString } = request.body

  const [employees, equipment, crews] = await Promise.all([
    getAvailableEmployees(shiftDateString),
    getAvailableEquipment(shiftDateString),
    getAvailableCrews(shiftDateString)
  ])

  response.json({
    crews,
    employees,
    equipment,
    success: true
  })
}
