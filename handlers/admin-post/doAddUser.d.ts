import type { Request, Response } from 'express';
import getUsers from '../../database/users/getUsers.js';
export type DoAddUserResponse = {
    success: boolean;
    users: Awaited<ReturnType<typeof getUsers>>;
};
export default function handler(request: Request<unknown, unknown, {
    userName: string;
}>, response: Response<DoAddUserResponse>): Promise<void>;
