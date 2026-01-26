import type { Request, Response } from 'express'

import createAssignedToItem from '../../database/assignedTo/createAssignedToItem.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddAssignedToItemResponse =
  | {
      success: true
      assignedToId: number
    }
  | {
      success: false
      errorMessage: string
    }

export default async function handler(
  request: Request,
  response: Response<DoAddAssignedToItemResponse>
): Promise<void> {
  try {
    const assignedToId = await createAssignedToItem(
      request.body,
      request.session.user?.userName ?? ''
    )

    response.json({
      success: true,
      assignedToId
    } satisfies DoAddAssignedToItemResponse)
  } catch (error) {
    response.json({
      success: false,
      errorMessage: (error as Error).message
    } satisfies DoAddAssignedToItemResponse)
  }
}
