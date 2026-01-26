import type { Request, Response } from 'express';
export type DoDeleteNotificationConfigurationResponse = {
    success: boolean;
    errorMessage?: string;
};
export default function handler(request: Request, response: Response<DoDeleteNotificationConfigurationResponse>): Promise<void>;
