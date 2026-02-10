export interface UpdateNotificationConfigurationForm {
    notificationConfigurationId: number | string;
    notificationQueue: string;
    notificationType: string;
    notificationTypeFormJson: string;
    assignedToId?: number | string;
    isActive: boolean | string;
}
export default function updateNotificationConfiguration(form: UpdateNotificationConfigurationForm, userName: string): Promise<boolean>;
