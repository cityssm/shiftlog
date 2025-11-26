import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import { usePartialOrCurrentValue } from '../../helpers/sync.helpers.js'
import type { Location } from '../../types/record.types.js'

import getLocationByAddress1 from './getLocationByAddress1.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:database:equipment:addOrUpdateSyncedEquipment`
)

async function addSyncedLocation(
  partialLocation: Partial<Location>,
  syncUserName: string
): Promise<void> {
  const pool = await getShiftLogConnectionPool()

  await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .input('locationName', partialLocation.locationName ?? '')
    .input('address1', partialLocation.address1 ?? '')
    .input('address2', partialLocation.address2 ?? '')
    .input('cityProvince', partialLocation.cityProvince ?? '')
    .input('latitude', partialLocation.latitude ?? undefined)
    .input('longitude', partialLocation.longitude ?? undefined)
    .input('userGroupId', partialLocation.userGroupId ?? undefined)
    .input('recordSync_isSynced', true)
    .input('recordSync_source', partialLocation.recordSync_source ?? undefined)
    .input(
      'recordSync_dateTime',
      partialLocation.recordSync_dateTime ?? new Date()
    )
    .input('recordCreate_userName', syncUserName)
    .input('recordCreate_dateTime', new Date())
    .input('recordUpdate_userName', syncUserName)
    .input('recordUpdate_dateTime', new Date()).query(/* sql */ `
      insert into ShiftLog.Locations (
        instance, locationName, address1, address2,
        cityProvince, latitude, longitude, userGroupId,
        recordSync_isSynced, recordSync_source, recordSync_dateTime,
        recordCreate_userName, recordCreate_dateTime,
        recordUpdate_userName, recordUpdate_dateTime
      ) values (
        @instance, @locationName, @address1, @address2,
        @cityProvince, @latitude, @longitude, @userGroupId,
        @recordSync_isSynced, @recordSync_source, @recordSync_dateTime,
        @recordCreate_userName, @recordCreate_dateTime,
        @recordUpdate_userName, @recordUpdate_dateTime
      )
    `)
}

async function updateSyncedLocation(
  currentLocation: Location,
  partialLocation: Partial<Location>,
  syncUserName: string
): Promise<void> {
  const updateLocation: Location = {
    locationId: currentLocation.locationId,
    locationName:
      usePartialOrCurrentValue(
        partialLocation.locationName,
        currentLocation.locationName
      ) ?? '',

    address1:
      usePartialOrCurrentValue(
        partialLocation.address1,
        currentLocation.address1
      ) ?? '',

    address2:
      usePartialOrCurrentValue(
        partialLocation.address2,
        currentLocation.address2
      ) ?? '',

    cityProvince:
      usePartialOrCurrentValue(
        partialLocation.cityProvince,
        currentLocation.cityProvince
      ) ?? '',

    latitude: usePartialOrCurrentValue(
      partialLocation.latitude,
      currentLocation.latitude
    ),

    longitude: usePartialOrCurrentValue(
      partialLocation.longitude,
      currentLocation.longitude
    ),

    userGroupId: usePartialOrCurrentValue(
      partialLocation.userGroupId,
      currentLocation.userGroupId
    ),

    recordSync_isSynced: true,

    recordSync_source: partialLocation.recordSync_source,

    recordSync_dateTime: partialLocation.recordSync_dateTime ?? new Date()
  }

  const pool = await getShiftLogConnectionPool()

  await pool
    .request()
    .input('locationId', updateLocation.locationId)
    .input('locationName', updateLocation.locationName)
    .input('address1', updateLocation.address1)
    .input('address2', updateLocation.address2)
    .input('cityProvince', updateLocation.cityProvince)
    .input('latitude', updateLocation.latitude)
    .input('longitude', updateLocation.longitude)
    .input('userGroupId', updateLocation.userGroupId)
    .input('recordSync_isSynced', updateLocation.recordSync_isSynced)
    .input('recordSync_source', updateLocation.recordSync_source)
    .input('recordSync_dateTime', updateLocation.recordSync_dateTime)
    .input('recordUpdate_userName', syncUserName)
    .input('recordUpdate_dateTime', new Date()).query(/* sql */ `
      update ShiftLog.Locations
      set locationName = @locationName,
        address1 = @address1,
        address2 = @address2,
        cityProvince = @cityProvince,
        latitude = @latitude,
        longitude = @longitude,
        userGroupId = @userGroupId,
        recordSync_isSynced = @recordSync_isSynced,
        recordSync_source = @recordSync_source,
        recordSync_dateTime = @recordSync_dateTime,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime,
        recordDelete_userName = null,
        recordDelete_dateTime = null
      where locationId = @locationId
    `)
}

export default async function addOrUpdateSyncedLocation(
  partialLocation: Partial<Location>,
  syncUserName: string
): Promise<boolean> {
  const currentLocation = await getLocationByAddress1(
    partialLocation.address1 ?? ''
  )

  try {
    if (currentLocation === undefined) {
      debug('Adding new synced location', partialLocation.address1)
      await addSyncedLocation(partialLocation, syncUserName)
    } else if (currentLocation.recordSync_isSynced) {
      debug('Updating synced location', partialLocation.address1)
      await updateSyncedLocation(currentLocation, partialLocation, syncUserName)
    } else {
      debug('Skipping location not synced', partialLocation.address1)

      return false
    }
  } catch (error) {
    debug(
      `Error adding or updating synced location ${partialLocation.address1}: `,
      error
    )

    return false
  }

  return true
}
