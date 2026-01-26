import type { Request, Response } from 'express'

import getShiftCrews from '../../database/shifts/getShiftCrews.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftCrewsResponse = {
  success: boolean
  shiftCrews: Awaited<ReturnType<typeof getShiftCrews>>
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response<DoGetShiftCrewsResponse>
): Promise<void> {
  const shiftCrews = await getShiftCrews(
    request.body.shiftId,
    request.session.user
  )

  response.json({
    success: true,
    shiftCrews
  } satisfies DoGetShiftCrewsResponse)
}
