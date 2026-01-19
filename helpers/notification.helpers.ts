import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import type { NotificationQueueType } from '../tasks/notifications/types.js'
import type { SendNotificationWorkerMessage } from '../types/application.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:helpers.notification:${process.pid}`)

export function sendNotificationWorkerMessage(
  notificationQueue: NotificationQueueType,
  recordId: number
): void {
  if (process.send === undefined) {
    return
  }

  const workerMessage: SendNotificationWorkerMessage = {
    messageType: 'sendNotification',
    notificationQueue,
    recordId,
    sourcePid: process.pid,
    sourceTimeMillis: Date.now(),
    targetProcesses: 'task.notifications'
  }

  debug(
    `Sending notification worker message: ${notificationQueue} for record ID ${recordId}`
  )

  process.send(workerMessage)
}
