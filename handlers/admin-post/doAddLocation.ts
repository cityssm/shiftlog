import type { Request, Response } from 'express'

import addLocation from '../../database/locations/addLocation.js'
import getLocations from '../../database/locations/getLocations.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoAddLocationResponse =
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
  response: Response<DoAddLocationResponse>
): Promise<void> {
  const address1 = (request.body.address1 as string) || ''
  const address2 = (request.body.address2 as string) || ''
  const cityProvince = (request.body.cityProvince as string) || ''

  const latitude =
    request.body.latitude === '' ? undefined : Number(request.body.latitude)

  const longitude =
    request.body.longitude === '' ? undefined : Number(request.body.longitude)

  const success = await addLocation(
    { address1, address2, cityProvince, latitude, longitude },
    request.session.user as User
  )

  if (success) {
    const locations = await getLocations()
    response.json({
      success: true,

      locations
    } satisfies DoAddLocationResponse)
  } else {
    response.json({
      success: false,

      message: 'Location could not be added.'
    } satisfies DoAddLocationResponse)
  }
}
