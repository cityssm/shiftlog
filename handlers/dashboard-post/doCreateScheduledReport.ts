import type { Request, Response } from 'express'

import createUserScheduledReport, {
  type CreateScheduledReportForm
} from '../../database/users/createUserScheduledReport.js'

export default async function handler(
  request: Request<unknown, unknown, CreateScheduledReportForm>,
  response: Response
): Promise<void> {
  const scheduledReportId = await createUserScheduledReport(
    request.session.user?.userName ?? '',
    request.body,
    request.session.user as User
  )

  response.json({
    success: scheduledReportId > 0,
    scheduledReportId
  })
}
