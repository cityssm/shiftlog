export interface CreateNotificationConfigurationForm {
    notificationQueue: string;
    notificationType: string;
    notificationTypeFormJson: string;
    assignedToId?: number | string;
    isActive: boolean | string;
}
export default function createNotificationConfiguration(form: CreateNotificationConfigurationForm, userName: string): Promise<number>;
