import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getShifts from '../../database/shifts/getShifts.js'
import type { Shift } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetAvailableShiftsResponse = {
  success: true
  shifts: Shift[]
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      supervisorEmployeeNumber?: string
      shiftDateString?: DateString
    }
  >,
  response: Response<DoGetAvailableShiftsResponse>
): Promise<void> {
  const { supervisorEmployeeNumber, shiftDateString } = request.body

  const result = await getShifts(
    {
      supervisorEmployeeNumber: supervisorEmployeeNumber ?? '',
      shiftDateString: shiftDateString ?? ''
    },
    {
      limit: -1,
      offset: 0
    },
    request.session.user
  )

  response.json({
    success: true,
    shifts: result.shifts
  })
}
