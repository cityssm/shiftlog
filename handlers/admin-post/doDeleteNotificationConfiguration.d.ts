import type { Request, Response } from 'express';
export type DoDeleteNotificationConfigurationResponse = {
    success: boolean;
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request, response: Response<DoDeleteNotificationConfigurationResponse>): Promise<void>;
