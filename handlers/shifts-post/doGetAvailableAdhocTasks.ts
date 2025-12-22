import type { Request, Response } from 'express'

import getAvailableAdhocTasks from '../../database/adhocTasks/getAvailableAdhocTasks.js'

export default async function handler(
  request: Request<unknown, unknown, { shiftId?: number | string }>,
  response: Response
): Promise<void> {
  const adhocTasks = await getAvailableAdhocTasks(request.body.shiftId)

  response.json({
    success: true,
    adhocTasks
  })
}
