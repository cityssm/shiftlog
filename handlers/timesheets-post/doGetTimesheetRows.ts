import type { Request, Response } from 'express'

import type { GetTimesheetRowsFilters } from '../../database/timesheets/getTimesheetRows.js'
import getTimesheetRows from '../../database/timesheets/getTimesheetRows.js'
import type { TimesheetRow } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetTimesheetRowsResponse = {
  rows: TimesheetRow[]
}

export default async function handler(
  request: Request<
    unknown,
    unknown,
    GetTimesheetRowsFilters & { timesheetId: number | string }
  >,
  response: Response<DoGetTimesheetRowsResponse>
): Promise<void> {
  const { timesheetId, ...filters } = request.body

  const rows = await getTimesheetRows(timesheetId, filters)

  response.json({
    rows
  })
}
