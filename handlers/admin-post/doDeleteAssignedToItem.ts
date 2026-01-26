import type { Request, Response } from 'express'

import deleteAssignedToItem from '../../database/assignedTo/deleteAssignedToItem.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteAssignedToItemResponse = {
  success: boolean
}

export default async function handler(
  request: Request,
  response: Response<DoDeleteAssignedToItemResponse>
): Promise<void> {
  const success = await deleteAssignedToItem(
    request.body.assignedToId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  } satisfies DoDeleteAssignedToItemResponse)
}
