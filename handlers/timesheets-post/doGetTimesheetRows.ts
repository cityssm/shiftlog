import type { Request, Response } from 'express'

import type { GetTimesheetRowsFilters } from '../../database/timesheets/getTimesheetRows.js'
import getTimesheetRows from '../../database/timesheets/getTimesheetRows.js'

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string } & GetTimesheetRowsFilters>,
  response: Response
): Promise<void> {
  const { timesheetId, ...filters } = request.body

  const rows = await getTimesheetRows(timesheetId, filters)

  response.json({
    rows
  })
}
