/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ScheduledTask } from '@cityssm/scheduled-task'
import { minutesToMillis } from '@cityssm/to-millis'
import Debug from 'debug'
import { Range } from 'node-schedule'

import addOrUpdateSyncedEquipment from '../../database/equipment/addOrUpdateSyncedEquipment.js'
import getMaximumEquipmentRecordSyncDateTime from '../../database/equipment/getMaximumEquipmentRecordSyncDateTime.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { Equipment } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:tasks:equipmentSync`)

const systemUserName = 'system'

const syncSource = getConfigProperty('equipment.syncSource')

let syncFunction:
  | (() => Promise<Array<Partial<Equipment>> | undefined>)
  | undefined

if (syncSource === 'pearl') {
  const importedModule = await import('./pearl.equipmentSync.js')
  syncFunction = importedModule.default
}

async function runSync(): Promise<void> {
  if (syncFunction === undefined) {
    debug('No sync function defined; exiting')
    return
  }

  debug('Running equipment sync function')

  let equipmentList: Array<Partial<Equipment>> | undefined = []

  try {
    equipmentList = await syncFunction()

    if (equipmentList === undefined) {
      debug('No equipment retrieved from sync function')
      return
    }

    debug(
      `Equipment sync function completed; retrieved ${equipmentList.length} pieces of equipment`
    )
  } catch (error) {
    debug('Error occurred during equipment sync:', error)
  }

  for (const equipmentToSync of equipmentList ?? []) {
    if (equipmentToSync.equipmentNumber === undefined) {
      continue
    }

    await addOrUpdateSyncedEquipment(equipmentToSync, systemUserName)
  }
}

if (syncFunction !== undefined) {
  debug(`Starting equipment sync task for source: ${syncSource}`)

  const lastRunDateTime = await getMaximumEquipmentRecordSyncDateTime()

  const scheduledTask = new ScheduledTask(
    `Equipment Sync (${syncSource})`,
    runSync,
    {
      schedule: {
        dayOfWeek: new Range(1, 5),
        hour: new Range(8, 16),
        minute: 0,
        second: 0
      },

      lastRunMillis: lastRunDateTime?.getTime(),
      minimumIntervalMillis: minutesToMillis(45),

      startTask: true
    }
  )

  if (Date.now() - (lastRunDateTime?.getTime() ?? 0) > minutesToMillis(45)) {
    await scheduledTask.runTask()
  }
}
