import type { Request, Response } from 'express'

import deleteAssignedToItem from '../../database/assignedTo/deleteAssignedToItem.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await deleteAssignedToItem(
    request.body.assignedToId,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
