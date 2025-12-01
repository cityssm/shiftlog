import type { Request, Response } from 'express'

import getDeletedTimesheets from '../../database/timesheets/getDeletedTimesheets.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      limit: number | string
      offset: number | string
    }
  >,
  response: Response
): Promise<void> {
  const { timesheets, totalCount } = await getDeletedTimesheets(
    {
      limit: request.body.limit,
      offset: request.body.offset
    },
    request.session.user
  )

  response.json({
    success: true,
    timesheets,
    totalCount
  })
}
