import type { Request, Response } from 'express'

import updateAssignedToItem from '../../database/assignedTo/updateAssignedToItem.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await updateAssignedToItem(
    request.body,
    request.session.user?.userName ?? ''
  )

  response.json({
    success
  })
}
