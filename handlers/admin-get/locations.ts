import type { Request, Response } from 'express'

import getLocations from '../../database/locations/getLocations.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const locations = await getLocations()

  response.render('admin/locations', {
    headTitle: 'Location Maintenance',
    locations
  })
}
