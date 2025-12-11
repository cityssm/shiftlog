import type { Request, Response } from 'express'

import updateUserScheduledReport, {
  type UpdateScheduledReportForm
} from '../../database/users/updateUserScheduledReport.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateScheduledReportForm>,
  response: Response
): Promise<void> {
  const success = await updateUserScheduledReport(
    request.session.user?.userName ?? '',
    request.body,
    request.session.user as User
  )

  response.json({
    success
  })
}
