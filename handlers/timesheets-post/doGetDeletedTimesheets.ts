import type { Request, Response } from 'express'

import getDeletedTimesheets from '../../database/timesheets/getDeletedTimesheets.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const timesheets = await getDeletedTimesheets(request.session.user)

  response.json({
    success: true,
    timesheets
  })
}
