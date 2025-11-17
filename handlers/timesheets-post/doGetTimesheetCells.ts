import type { Request, Response } from 'express'

import getTimesheetCells from '../../database/timesheets/getTimesheetCells.js'

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response
): Promise<void> {
  const cells = await getTimesheetCells(request.body.timesheetId)

  response.json({
    cells
  })
}
