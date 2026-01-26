import type { Request, Response } from 'express'

import type { ReorderTimesheetColumnsForm } from '../../database/timesheets/reorderTimesheetColumns.js'
import reorderTimesheetColumns from '../../database/timesheets/reorderTimesheetColumns.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoReorderTimesheetColumnsResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, ReorderTimesheetColumnsForm>,
  response: Response<DoReorderTimesheetColumnsResponse>
): Promise<void> {
  const success = await reorderTimesheetColumns(request.body)

  response.json({
    success
  })
}
