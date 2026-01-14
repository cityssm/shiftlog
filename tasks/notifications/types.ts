export type NotificationQueueType = 'workOrder.create' | 'workOrder.update'

export interface NtfyNotificationConfig {
  topic: string
}

export interface EmailNotificationConfig {
  recipientEmails: string[]
}

export interface MsTeamsNotificationConfig {
  webhookUrl: string
}
