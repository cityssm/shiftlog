import type { Request, Response } from 'express'

import doGetRequestorSuggestions from '../../database/workOrders/getRequestorSuggestions.js'

export default async function handler(
  request: Request<unknown, unknown, { searchString: string }>,
  response: Response
): Promise<void> {
  const requestors = await doGetRequestorSuggestions(
    request.body.searchString,
    request.session.user
  )

  response.json({
    success: true,
    
    requestors
  })
}
