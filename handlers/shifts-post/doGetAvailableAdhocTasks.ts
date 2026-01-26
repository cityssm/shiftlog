import type { Request, Response } from 'express'

import getAvailableAdhocTasks from '../../database/adhocTasks/getAvailableAdhocTasks.js'
import type { AdhocTask } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetAvailableAdhocTasksResponse = {
  success: true
  adhocTasks: AdhocTask[]
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId?: number | string }>,
  response: Response<DoGetAvailableAdhocTasksResponse>
): Promise<void> {
  const adhocTasks = await getAvailableAdhocTasks(request.body.shiftId)

  response.json({
    success: true,
    adhocTasks
  })
}
