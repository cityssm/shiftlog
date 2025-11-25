import type { Request, Response } from 'express'

import getLocationSuggestions from '../../database/locations/getLocationSuggestions.js'

export default async function handler(
  request: Request<unknown, unknown, { searchString: string }>,
  response: Response
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
