import type { Request, Response } from 'express';
export type DoAddNotificationConfigurationResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    notificationConfigurationId: number;
};
export default function handler(request: Request, response: Response<DoAddNotificationConfigurationResponse>): Promise<void>;
