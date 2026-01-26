import type { Request, Response } from 'express';
export type DoAddNotificationConfigurationResponse = {
    success: true;
    notificationConfigurationId: number;
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request, response: Response<DoAddNotificationConfigurationResponse>): Promise<void>;
