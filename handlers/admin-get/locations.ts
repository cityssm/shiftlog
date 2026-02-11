import type { Request, Response } from 'express'

import getLocations from '../../database/locations/getLocations.js'
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const locations = await getLocations()
  const defaultCityProvince = await getCachedSettingValue(
    'locations.defaultCityProvince'
  )

  response.render('admin/locations', {
    headTitle: 'Location Maintenance',
    section: 'admin',

    locations,
    defaultCityProvince
  })
}
