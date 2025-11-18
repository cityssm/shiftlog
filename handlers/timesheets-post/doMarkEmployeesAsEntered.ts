import type { Request, Response } from 'express'

import markEmployeesAsEntered from '../../database/timesheets/markEmployeesAsEntered.js'

export default async function handler(
  request: Request<unknown, unknown, { timesheetId: number | string }>,
  response: Response
): Promise<void> {
  const success = await markEmployeesAsEntered(
    request.body.timesheetId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
