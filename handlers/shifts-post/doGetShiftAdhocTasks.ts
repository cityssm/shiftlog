import type { Request, Response } from 'express'

import getShiftAdhocTasks from '../../database/adhocTasks/getShiftAdhocTasks.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetShiftAdhocTasksResponse = {
  success: boolean
  shiftAdhocTasks: Awaited<ReturnType<typeof getShiftAdhocTasks>>
}

export default async function handler(
  request: Request<unknown, unknown, { shiftId: number | string }>,
  response: Response<DoGetShiftAdhocTasksResponse>
): Promise<void> {
  const shiftAdhocTasks = await getShiftAdhocTasks(request.body.shiftId)

  response.json({
    success: true,

    shiftAdhocTasks
  } satisfies DoGetShiftAdhocTasksResponse)
}
