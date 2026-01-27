import type { Request, Response } from 'express'

import createAssignedToItem, {
  type CreateAssignedToForm
} from '../../database/assignedTo/createAssignedToItem.js'

export type DoAddAssignedToItemResponse =
  | {
      success: false

      errorMessage: string
    }
  | {
      success: true

      assignedToId: number
    }

export default async function handler(
  request: Request<unknown, unknown, CreateAssignedToForm>,
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
    })
  } catch (error) {
    response.json({
      success: false,

      errorMessage: (error as Error).message
    })
  }
}
