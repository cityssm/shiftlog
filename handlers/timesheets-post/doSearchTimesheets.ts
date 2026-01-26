import type { Request, Response } from 'express'

import type {
  GetTimesheetsFilters,
  GetTimesheetsOptions
} from '../../database/timesheets/getTimesheets.js'
import getTimesheets from '../../database/timesheets/getTimesheets.js'
import type { Timesheet } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoSearchTimesheetsResponse = {
  success: boolean

  timesheets: Timesheet[]

  totalCount: number

  limit: number
  offset: number
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    GetTimesheetsFilters & GetTimesheetsOptions
  >,
  response: Response<DoSearchTimesheetsResponse>
): Promise<void> {
  const result = await getTimesheets(
    request.body,
    request.body,
    request.session.user
  )

  response.json({
    success: true,

    timesheets: result.timesheets,
    totalCount: result.totalCount,

    limit:
      typeof request.body.limit === 'number'
        ? request.body.limit
        : Number.parseInt(request.body.limit, 10),

    offset:
      typeof request.body.offset === 'number'
        ? request.body.offset
        : Number.parseInt(request.body.offset, 10)
  })
}
