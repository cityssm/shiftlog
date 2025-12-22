import downloadLayer from '@cityssm/esri-mapserver-layer-dl'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Location } from '../../types/record.types.js'

export default async function getLocations(): Promise<
  Array<Partial<Location>> | undefined
> {
  const locationConfig = getConfigProperty('locations')

  if (locationConfig.syncSource !== 'arcgis') {
    return undefined
  }

  const response = await downloadLayer<Record<string, unknown>>(
    locationConfig.layerURL,
    {
      where: locationConfig.whereClause ?? '1=1'
    }
  )

  const locations: Array<Partial<Location>> = []

  for (const gisRecord of response) {
    const location = {
      recordSync_isSynced: true,
      recordSync_source: 'arcgis'
    } satisfies Partial<Location>

    for (const [fieldName, mapping] of Object.entries(
      locationConfig.mappings
    )) {
      let value: unknown

      if (typeof mapping === 'function') {
        value = mapping(gisRecord)
      } else if (typeof mapping === 'string') {
        // eslint-disable-next-line security/detect-object-injection
        value = gisRecord[mapping]
      }

      if (value !== undefined) {
        location[fieldName as keyof Location] =
          value as Location[keyof Location]
      }
    }

    locations.push(location as Partial<Location>)
  }

  return locations
}
