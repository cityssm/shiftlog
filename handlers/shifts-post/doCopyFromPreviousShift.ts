import type { Request, Response } from 'express'

import copyFromPreviousShift from '../../database/shifts/copyFromPreviousShift.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const success = await copyFromPreviousShift(
    request.body,
    request.session.user as User
  )

  response.json({
    success
  })
}
