export const notificationQueueTypes = [
  'workOrder.create',
  'workOrder.update'
] as const

export type NotificationQueueType = typeof notificationQueueTypes[number]

export interface NtfyNotificationConfig {
  topic: string
}

export interface EmailNotificationConfig {
  recipientEmails: string[]
}

export interface MsTeamsNotificationConfig {
  webhookUrl: string
}
