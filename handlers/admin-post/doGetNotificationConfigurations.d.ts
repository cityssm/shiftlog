import type { Request, Response } from 'express';
import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js';
export type DoGetNotificationConfigurationsResponse = {
    success: true;
    notificationConfigurations: Awaited<ReturnType<typeof getNotificationConfigurations>>;
};
export default function handler(_request: Request, response: Response<DoGetNotificationConfigurationsResponse>): Promise<void>;
