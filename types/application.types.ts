import type { NotificationQueueType } from '../tasks/notifications/types.js'

export interface ClearCacheWorkerMessage extends WorkerMessage {
  messageType: 'clearCache'
  targetProcesses: 'workers'

  tableName: string
}

export interface SendNotificationWorkerMessage extends WorkerMessage {
  messageType: 'sendNotification'
  targetProcesses: 'task.notifications'

  notificationQueue: NotificationQueueType
  recordId: number
}

export interface WorkerMessage {
  messageType: string

  sourcePid: number
  sourceTimeMillis: number
  targetProcesses: 'task.notifications' | 'workers'
}
