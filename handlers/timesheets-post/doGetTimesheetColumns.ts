import type { Request, Response } from 'express'

import getTimesheetColumns from '../../database/timesheets/getTimesheetColumns.js'

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response
): Promise<void> {
  const columns = await getTimesheetColumns(request.body.timesheetId)

  response.json({
    columns
  })
}
