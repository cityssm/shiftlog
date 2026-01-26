import type { Request, Response } from 'express'

import getLocationSuggestions from '../../database/locations/getLocationSuggestions.js'
import type { Location } from '../../types/record.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetLocationSuggestionsResponse = {
  success: true
  locations: Location[]
}

export default async function handler(
  request: Request<unknown, unknown, { searchString: string }>,
  response: Response<DoGetLocationSuggestionsResponse>
): Promise<void> {
  const locations = await getLocationSuggestions(
    request.body.searchString,
    request.session.user
  )

  response.json({
    success: true,

    locations
  })
}
