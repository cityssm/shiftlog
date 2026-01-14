import type { NotificationQueueType } from '../tasks/notifications/types.js'

export interface ClearCacheWorkerMessage extends WorkerMessage {
  messageType: 'clearCache'

  tableName: string
}

export interface SendNotificationWorkerMessage extends WorkerMessage {
  messageType: 'sendNotification'

  notificationQueue: NotificationQueueType
  recordId: number
}

export interface WorkerMessage {
  messageType: string

  sourcePid: number
  sourceTimeMillis: number
  targetProcesses: 'tasks' | 'workers'
}
