import type { Request, Response } from 'express'

import getTimesheetsByShift from '../../database/timesheets/getTimesheetsByShift.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftTimesheetsResponse = {
  success: boolean
  timesheets: Awaited<ReturnType<typeof getTimesheetsByShift>>
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response<DoGetShiftTimesheetsResponse>
): Promise<void> {
  const timesheets = await getTimesheetsByShift(
    request.body.shiftId,
    request.session.user
  )

  response.json({
    success: true,
    timesheets
  } satisfies DoGetShiftTimesheetsResponse)
}
