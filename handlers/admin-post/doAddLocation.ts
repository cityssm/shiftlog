import type { Request, Response } from 'express'

import addLocation from '../../database/locations/addLocation.js'
import getLocations from '../../database/locations/getLocations.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const locationName = request.body.locationName as string
  const address1 = (request.body.address1 as string) || ''
  const address2 = (request.body.address2 as string) || ''
  const cityProvince = (request.body.cityProvince as string) || ''

  const latitude =
    request.body.latitude === '' ? null : Number(request.body.latitude)

  const longitude =
    request.body.longitude === '' ? null : Number(request.body.longitude)

  const success = await addLocation(
    { locationName, address1, address2, cityProvince, latitude, longitude },
    request.session.user as User
  )

  if (success) {
    const locations = await getLocations()
    response.json({
      success: true,

      locations
    })
  } else {
    response.json({
      success: false,

      message: 'Location could not be added.'
    })
  }
}
