import type { Request, Response } from 'express'

import getDeletedShifts from '../../database/shifts/getDeletedShifts.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetDeletedShiftsResponse = {
  success: boolean
  shifts: Awaited<ReturnType<typeof getDeletedShifts>>
}

export default async function handler(
  request: Request,
  response: Response<DoGetDeletedShiftsResponse>
): Promise<void> {
  const shifts = await getDeletedShifts(request.session.user)

  response.json({
    success: true,
    shifts
  } satisfies DoGetDeletedShiftsResponse)
}
