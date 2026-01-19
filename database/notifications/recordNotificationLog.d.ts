interface NotificationLogForm {
    notificationConfigurationId: number | string;
    recordId: number | string;
    notificationDate?: Date;
    isSuccess: boolean;
    errorMessage: string;
}
export default function recordNotificationLog(form: NotificationLogForm): Promise<void>;
export {};
