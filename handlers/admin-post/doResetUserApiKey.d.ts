import type { Request, Response } from 'express';
import type { DatabaseUser } from '../../types/record.types.js';
export type DoResetUserApiKeyResponse = {
    message: string;
    success: false;
} | {
    message: string;
    success: true;
    users: DatabaseUser[];
    apiKey: string;
};
export default function handler(request: Request<unknown, unknown, {
    userName: string;
}>, response: Response<DoResetUserApiKeyResponse>): Promise<void>;
