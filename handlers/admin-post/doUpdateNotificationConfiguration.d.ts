import type { Request, Response } from 'express';
export type DoUpdateNotificationConfigurationResponse = {
    success: boolean;
    errorMessage?: string;
};
export default function handler(request: Request, response: Response<DoUpdateNotificationConfigurationResponse>): Promise<void>;
