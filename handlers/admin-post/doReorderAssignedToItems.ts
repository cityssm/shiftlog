import type { Request, Response } from 'express'

import reorderAssignedToItems from '../../database/assignedTo/reorderAssignedToItems.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await reorderAssignedToItems(
    request.body.assignedToIds as Array<number | string>,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
