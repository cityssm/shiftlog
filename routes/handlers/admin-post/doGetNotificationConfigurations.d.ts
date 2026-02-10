import type { Request, Response } from 'express';
import type { NotificationConfiguration } from '../../types/record.types.js';
export type DoGetNotificationConfigurationsResponse = {
    success: true;
    notificationConfigurations: NotificationConfiguration[];
};
export default function handler(_request: Request, response: Response<DoGetNotificationConfigurationsResponse>): Promise<void>;
