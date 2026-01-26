import type { Request, Response } from 'express'

import deleteLocation from '../../database/locations/deleteLocation.js'
import getLocations from '../../database/locations/getLocations.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoDeleteLocationResponse =
  | {
      success: true
      locations: Awaited<ReturnType<typeof getLocations>>
    }
  | {
      success: false
      message: string
    }

export default async function handler(
  request: Request,
  response: Response<DoDeleteLocationResponse>
): Promise<void> {
  const locationId = Number(request.body.locationId)

  const success = await deleteLocation(
    locationId,
    request.session.user as User
  )

  if (success) {
    const locations = await getLocations()
    response.json({
      success: true,
      locations
    } satisfies DoDeleteLocationResponse)
  } else {
    response.json({
      success: false,
      message: 'Location could not be deleted.'
    } satisfies DoDeleteLocationResponse)
  }
}
