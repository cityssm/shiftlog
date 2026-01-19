import { minutesToMillis } from '@cityssm/to-millis'
import UniqueTimedEntryQueue from '@cityssm/unique-timed-entry-queue'
import Debug from 'debug'
import exitHook from 'exit-hook'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async/fixed'

import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js'
import recordNotificationLog from '../../database/notifications/recordNotificationLog.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { SendNotificationWorkerMessage } from '../../types/application.types.js'
import type { NotificationConfiguration } from '../../types/record.types.js'

import {
  type Protocol,
  getProtocolFunction
} from './protocols/protocol.helpers.js'
import type { NotificationQueueType } from './types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:tasks.notifications`)

const createMillis = minutesToMillis(1)
const updateMillis = minutesToMillis(2)

const pollingIntervalMillis = Math.min(createMillis, updateMillis) / 2

const notificationQueues: Partial<
  Record<NotificationQueueType, UniqueTimedEntryQueue>
> = {}

if (getConfigProperty('workOrders.isEnabled')) {
  notificationQueues['workOrder.create'] = new UniqueTimedEntryQueue(
    createMillis
  )

  notificationQueues['workOrder.update'] = new UniqueTimedEntryQueue(
    updateMillis
  )
}

async function sendNotifications(): Promise<void> {
  const notificationConfigurationsByQueue: Partial<
    Record<NotificationQueueType, NotificationConfiguration[]>
  > = {}

  for (const [notificationQueueType, notificationQueue] of Object.entries(
    notificationQueues
  )) {
    const recordId = notificationQueue.dequeue()

    if (recordId === undefined) {
      continue
    }

    let notificationConfigurations =
      notificationConfigurationsByQueue[
        notificationQueueType as NotificationQueueType
      ]

    if (notificationConfigurations === undefined) {
      // eslint-disable-next-line no-await-in-loop
      notificationConfigurations = await getNotificationConfigurations(
        notificationQueueType as NotificationQueueType
      )

      notificationConfigurationsByQueue[
        notificationQueueType as NotificationQueueType
      ] = notificationConfigurations
    }

    if (notificationConfigurations.length === 0) {
      notificationQueue.clearAll()
      continue
    }

    for (const notificationConfiguration of notificationConfigurations) {
      if (!notificationConfiguration.isActive) {
        continue
      }

      debug(
        `Sending notification: ${notificationQueueType} for record ID ${recordId}`
      )

      const protocolFunction = getProtocolFunction(
        notificationConfiguration.notificationType as Protocol,
        notificationQueueType as NotificationQueueType
      )

      if (protocolFunction === undefined) {
        debug(
          `No protocol function found for notification queue: ${notificationConfiguration.notificationQueue}`
        )
      } else {
        // eslint-disable-next-line no-await-in-loop
        const notificationResult = await protocolFunction(
          notificationConfiguration,
          recordId
        )

        if (notificationResult !== undefined) {
          // eslint-disable-next-line no-await-in-loop
          await recordNotificationLog({
            notificationConfigurationId:
              notificationConfiguration.notificationConfigurationId,
            recordId,

            notificationDate: new Date(),

            isSuccess: notificationResult.success,

            errorMessage: notificationResult.success
              ? ''
              : (notificationResult.errorMessage ?? 'Unknown error')
          })
        }
      }
    }
  }
}

/*
 * Message Handling
 */

process.on('message', (message: SendNotificationWorkerMessage) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (message.messageType !== 'sendNotification') {
    return
  }

  debug(
    `Received notification request: ${message.notificationQueue} for record ID ${message.recordId}`
  )

  switch (message.notificationQueue) {
    case 'workOrder.create': {
      notificationQueues[message.notificationQueue]?.enqueue(message.recordId)
      break
    }
    case 'workOrder.update': {
      if (
        notificationQueues['workOrder.create']?.hasPendingEntry(
          message.recordId
        ) ??
        false
      ) {
        // If a create notification is pending, skip the update and reset the timer
        notificationQueues['workOrder.create']?.enqueue(
          message.recordId,
          updateMillis
        )
      } else {
        notificationQueues['workOrder.update']?.enqueue(message.recordId)
      }
      break
    }
  }
})

/*
 * Schedule
 */

if (Object.keys(notificationQueues).length > 0) {
  const task = setIntervalAsync(sendNotifications, pollingIntervalMillis)

  exitHook(() => {
    clearIntervalAsync(task).catch(() => {
      // ignore
    })
  })
}
