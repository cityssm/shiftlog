import type { Request, Response } from 'express';
import getUsers from '../../database/users/getUsers.js';
export type DoToggleUserPermissionResponse = {
    success: true;
    message: string;
    users: Awaited<ReturnType<typeof getUsers>>;
} | {
    success: false;
    message: string;
};
export default function handler(request: Request<unknown, unknown, {
    userName?: string;
    permissionField?: string;
}>, response: Response<DoToggleUserPermissionResponse>): Promise<void>;
