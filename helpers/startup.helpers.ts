import Debug from 'debug'

import createDataList from '../database/app/createDataList.js'
import getDataLists from '../database/app/getDataLists.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'

const debug = Debug(`${DEBUG_NAMESPACE}:startup`)

/**
 * System list keys that are required for the application to function properly.
 */
export const REQUIRED_SYSTEM_LISTS = {
  equipmentTypes: 'Equipment Types',

  assignedTo: 'Work Orders - Assigned To',
  workOrderPriorities: 'Work Orders - Priorities',
  workOrderStatuses: 'Work Orders - Statuses',

  adhocTaskTypes: 'Adhoc Task Types',
  shiftTimes: 'Shifts - Times',
  shiftTypes: 'Shifts - Types',

  jobClassifications: 'Timesheets - Job Classifications',
  timeCodes: 'Timesheets - Time Codes',
  timesheetTypes: 'Timesheets - Types'
} as const

/**
 * Validates that all required system lists exist in the DataLists table.
 * This check should be run on application startup to ensure database integrity.
 * @throws {Error} if any required system lists are missing
 */
export async function validateSystemLists(): Promise<void> {
  debug('Validating system lists...')

  const dataLists = await getDataLists()

  const existingSystemListKeys = new Set(
    dataLists
      .filter((list) => list.isSystemList)
      .map((list) => list.dataListKey)
  )

  const missingSystemLists = Object.keys(REQUIRED_SYSTEM_LISTS).filter(
    (requiredKey) => !existingSystemListKeys.has(requiredKey)
  )

  for (const missingKey of missingSystemLists) {
    const listName =
      REQUIRED_SYSTEM_LISTS[missingKey as keyof typeof REQUIRED_SYSTEM_LISTS]

    debug(
      `Missing required system list: ${missingKey} (${listName}), creating...`
    )

    // eslint-disable-next-line no-await-in-loop
    await createDataList(
      {
        dataListKey: missingKey,
        dataListName: listName,
        isSystemList: true
      },
      'system'
    )
  }

  debug(
    `All ${Object.keys(REQUIRED_SYSTEM_LISTS).length} required system lists are present`
  )
}
