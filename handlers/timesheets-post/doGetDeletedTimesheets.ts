import type { Request, Response } from 'express'

import getDeletedTimesheets from '../../database/timesheets/getDeletedTimesheets.js'
import type { Timesheet } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetDeletedTimesheetsResponse = {
  success: true
  timesheets: Timesheet[]
}

export default async function handler(
  request: Request,
  response: Response<DoGetDeletedTimesheetsResponse>
): Promise<void> {
  const timesheets = await getDeletedTimesheets(request.session.user)

  response.json({
    success: true,
    timesheets
  })
}
