import type { Request, Response } from 'express'

import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js'

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response
): Promise<void> {
  const shiftAdhocTasks = await getShiftAdhocTasks(request.body.shiftId)

  response.json({
    success: true,

    shiftAdhocTasks
  })
}
