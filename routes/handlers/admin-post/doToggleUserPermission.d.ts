import type { Request, Response } from 'express';
import type { DatabaseUser } from '../../types/record.types.js';
export type DoToggleUserPermissionResponse = {
    success: false;
    message: string;
} | {
    success: true;
    message: string;
    users: DatabaseUser[];
};
export default function handler(request: Request<unknown, unknown, {
    userName?: string;
    permissionField?: string;
}>, response: Response<DoToggleUserPermissionResponse>): Promise<void>;
