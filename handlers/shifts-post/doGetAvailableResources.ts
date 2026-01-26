import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getAvailableCrews, {
  type AvailableCrew
} from '../../database/shifts/getAvailableCrews.js'
import getAvailableEmployees, {
  type AvailableEmployee
} from '../../database/shifts/getAvailableEmployees.js'
import getAvailableEquipment, {
  type AvailableEquipment
} from '../../database/shifts/getAvailableEquipment.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetAvailableResourcesResponse = {
  success: true

  crews: AvailableCrew[]
  employees: AvailableEmployee[]
  equipment: AvailableEquipment[]
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
    success: true,

    crews,
    employees,
    equipment
  })
}
