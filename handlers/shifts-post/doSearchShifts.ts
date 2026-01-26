import type { Request, Response } from 'express'

import getShifts, {
  type GetShiftsFilters,
  type GetShiftsOptions
} from '../../database/shifts/getShifts.js'
import type { Shift } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoSearchShiftsResponse = {
  success: boolean

  shifts: Shift[]

  totalCount: number

  limit: number
  offset: number
}

export default async function handler(
  request: Request<unknown, unknown, GetShiftsFilters & GetShiftsOptions>,
  response: Response<DoSearchShiftsResponse>
): Promise<void> {
  const shiftsResults = await getShifts(
    request.body,
    request.body,
    request.session.user
  )

  response.json({
    success: true,

    shifts: shiftsResults.shifts,
    totalCount: shiftsResults.totalCount,

    limit:
      typeof request.body.limit === 'number'
        ? request.body.limit
        : Number.parseInt(request.body.limit, 10),

    offset:
      typeof request.body.offset === 'number'
        ? request.body.offset
        : Number.parseInt(request.body.offset, 10)
  } satisfies DoSearchShiftsResponse)
}
