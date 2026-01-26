import type { Request, Response } from 'express';
import getUsers from '../../database/users/getUsers.js';
export type DoUpdateUserSettingsResponse = {
    message: string;
    success: true;
    users: Awaited<ReturnType<typeof getUsers>>;
} | {
    message: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    userName: string;
}>, response: Response<DoUpdateUserSettingsResponse>): Promise<void>;
