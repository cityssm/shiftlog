import type { Request, Response } from 'express'

import getDeletedShifts from '../../database/shifts/getDeletedShifts.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    {
      limit: number | string
      offset: number | string
    }
  >,
  response: Response
): Promise<void> {
  const { shifts, totalCount } = await getDeletedShifts(
    {
      limit: request.body.limit,
      offset: request.body.offset
    },
    request.session.user
  )

  response.json({
    success: true,
    shifts,
    totalCount
  })
}
