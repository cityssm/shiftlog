import type { Request, Response } from 'express'

import deleteUserScheduledReport from '../../database/users/deleteUserScheduledReport.js'

export default async function handler(
  request: Request<unknown, unknown, { scheduledReportId: number | string }>,
  response: Response
): Promise<void> {
  const success = await deleteUserScheduledReport(
    request.session.user?.userName ?? '',
    request.body.scheduledReportId,
    request.session.user as User
  )

  response.json({
    success
  })
}
