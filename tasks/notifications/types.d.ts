export declare const notificationQueueTypes: readonly ["workOrder.create", "workOrder.update"];
export type NotificationQueueType = (typeof notificationQueueTypes)[number];
export declare const notificationTypes: readonly ["ntfy", "email", "msTeams"];
export type NotificationType = (typeof notificationTypes)[number];
export interface NtfyNotificationConfig {
    topic: string;
}
export interface EmailNotificationConfig {
    recipientEmails: string[];
}
export interface MsTeamsNotificationConfig {
    webhookUrl: string;
}
