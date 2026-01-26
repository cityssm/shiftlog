import type { Request, Response } from 'express'

import getTimesheetCells from '../../database/timesheets/getTimesheetCells.js'
import type { TimesheetCell } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetTimesheetCellsResponse = {
  cells: TimesheetCell[]
}

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response<DoGetTimesheetCellsResponse>
): Promise<void> {
  const cells = await getTimesheetCells(request.body.timesheetId)

  response.json({
    cells
  } satisfies DoGetTimesheetCellsResponse)
}
