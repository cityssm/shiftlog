import type { DateString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'

import getShiftsForBuilder, {
  type ShiftForBuilder
} from '../../database/shifts/getShiftsForBuilder.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftsForBuilderResponse = {
  success: boolean

  shifts: ShiftForBuilder[]
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { shiftDateString: DateString },
    unknown
  >,
  response: Response<DoGetShiftsForBuilderResponse>
): Promise<void> {
  const shifts = await getShiftsForBuilder(
    request.body.shiftDateString,
    request.session.user
  )

  response.json({
    success: true,
    
    shifts
  } satisfies DoGetShiftsForBuilderResponse)
}
