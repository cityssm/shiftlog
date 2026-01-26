import type { Request, Response } from 'express';
import type { DatabaseUser } from '../../types/record.types.js';
export type DoAddUserResponse = {
    success: boolean;
    users: DatabaseUser[];
};
export default function handler(request: Request<unknown, unknown, {
    userName: string;
}>, response: Response<DoAddUserResponse>): Promise<void>;
