import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    userGroupName: string;
}>, response: Response): Promise<void>;
