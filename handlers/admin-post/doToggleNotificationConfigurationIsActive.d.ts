import type { Request, Response } from 'express';
export type DoToggleNotificationConfigurationIsActiveResponse = {
    success: boolean;
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request, response: Response<DoToggleNotificationConfigurationIsActiveResponse>): Promise<void>;
