import type { Request, Response } from 'express'

import getLocations from '../../database/locations/getLocations.js'
import updateLocation from '../../database/locations/updateLocation.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const locationId = Number(request.body.locationId)
  const locationName = request.body.locationName as string
  const address1 = (request.body.address1 as string) || ''
  const address2 = (request.body.address2 as string) || ''
  const cityProvince = (request.body.cityProvince as string) || ''
  const latitude = request.body.latitude !== '' ? Number(request.body.latitude) : null
  const longitude = request.body.longitude !== '' ? Number(request.body.longitude) : null

  const success = await updateLocation(
    locationId,
    locationName,
    address1,
    address2,
    cityProvince,
    latitude,
    longitude,
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
      message: 'Location could not be updated.'
    })
  }
}
