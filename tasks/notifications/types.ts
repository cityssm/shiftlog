export const notificationQueueTypes = [
  'workOrder.create',
  'workOrder.update'
] as const

export type NotificationQueueType = (typeof notificationQueueTypes)[number]

export const notificationTypes = ['ntfy', 'email', 'msTeams'] as const

export type NotificationType = (typeof notificationTypes)[number]

export interface NtfyNotificationConfig {
  topic: string
}

export interface EmailNotificationConfig {
  recipientEmails: string[]
}

export interface MsTeamsNotificationConfig {
  webhookUrl: string
}

export interface NotificationFunctionResult {
  success: boolean
  errorMessage?: string
}

export type NotificationFunction = (
  notificationConfiguration: unknown,
  recordId: number | string
) => Promise<NotificationFunctionResult | undefined>
