import type { Request, Response } from 'express'

import deleteTimesheetRow from '../../database/timesheets/deleteTimesheetRow.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteTimesheetRowResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, { timesheetRowId: number | string }>,
  response: Response<DoDeleteTimesheetRowResponse>
): Promise<void> {
  const success = await deleteTimesheetRow(request.body.timesheetRowId)

  response.json({
    success
  } satisfies DoDeleteTimesheetRowResponse)
}
