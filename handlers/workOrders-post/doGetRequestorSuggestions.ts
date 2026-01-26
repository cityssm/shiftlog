import type { Request, Response } from 'express'

import doGetRequestorSuggestions from '../../database/workOrders/getRequestorSuggestions.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetRequestorSuggestionsResponse = {
  success: boolean
  requestors: Array<{ requestorContactInfo: string; requestorName: string }>
}

export default async function handler(
  request: Request<unknown, unknown, { searchString: string }>,
  response: Response<DoGetRequestorSuggestionsResponse>
): Promise<void> {
  const requestors = await doGetRequestorSuggestions(
    request.body.searchString,
    request.session.user
  )

  response.json({
    success: true,
    
    requestors
  } satisfies DoGetRequestorSuggestionsResponse)
}
