import type { Request, Response } from 'express'

import type { UpdateTimesheetRowForm } from '../../database/timesheets/updateTimesheetRow.js'
import updateTimesheetRow from '../../database/timesheets/updateTimesheetRow.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateTimesheetRowResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateTimesheetRowForm>,
  response: Response<DoUpdateTimesheetRowResponse>
): Promise<void> {
  const success = await updateTimesheetRow(request.body)

  response.json({
    success
  } satisfies DoUpdateTimesheetRowResponse)
}
