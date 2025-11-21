import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import getDataLists from '../database/app/getDataLists.js'

const debug = Debug(`${DEBUG_NAMESPACE}:startup`)

/**
 * System list keys that are required for the application to function properly.
 * These correspond to the system lists defined in database/initializeDatabase.sql
 */
const REQUIRED_SYSTEM_LISTS = [
  'equipmentTypes',
  'workOrderTypes',
  'workOrderStatuses',
  'assignedTo',
  'shiftTimes',
  'shiftTypes',
  'timesheetTypes',
  'jobClassifications',
  'timeCodes'
] as const

/**
 * Validates that all required system lists exist in the DataLists table.
 * This check should be run on application startup to ensure database integrity.
 * 
 * @throws Error if any required system lists are missing
 */
export async function validateSystemLists(): Promise<void> {
  debug('Validating system lists...')

  const dataLists = await getDataLists()
  const existingSystemListKeys = new Set(
    dataLists
      .filter((list) => list.isSystemList)
      .map((list) => list.dataListKey)
  )

  const missingSystemLists = REQUIRED_SYSTEM_LISTS.filter(
    (requiredKey) => !existingSystemListKeys.has(requiredKey)
  )

  if (missingSystemLists.length > 0) {
    const errorMessage = `Missing required system lists in DataLists table: ${missingSystemLists.join(', ')}`
    debug(errorMessage)
    throw new Error(errorMessage)
  }

  debug(`All ${REQUIRED_SYSTEM_LISTS.length} required system lists are present`)
}
