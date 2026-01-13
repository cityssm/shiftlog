import type { Request, Response } from 'express'

import createAssignedToItem from '../../database/assignedTo/createAssignedToItem.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const assignedToId = await createAssignedToItem(
      request.body,
      request.session.user?.userName ?? ''
    )

    response.json({
      success: true,
      assignedToId
    })
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    })
  }
}
