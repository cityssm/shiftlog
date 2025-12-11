import type { Request, Response } from 'express'

import getUserScheduledReports from '../../database/users/getUserScheduledReports.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const scheduledReports = await getUserScheduledReports(
    request.session.user?.userName ?? ''
  )

  response.json({
    success: true,
    scheduledReports
  })
}
